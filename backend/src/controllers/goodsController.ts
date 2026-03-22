/**
 * 商品控制器
 * 处理商品相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import Goods, { GoodsStatus } from '../models/goods';
import BookInfo from '../models/BookInfo';
import { isCollected, getUserCollectGoodsIds } from '../models/Collect';
import User from '../models/User';
import { success, successPage, error, sendBadRequest, sendNotFound, sendServerError } from '../utils/response';

/**
 * 获取商品列表（支持分页和筛选）
 * GET /api/goods
 */
export const getGoodsListHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        // 解析并验证查询参数
        const page = parseInt(req.query.page as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
        const keyword = req.query.keyword as string | undefined;
        const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
        const status = req.query.status ? parseInt(req.query.status as string, 10) : undefined;
        const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string, 10) : undefined;
        const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined;
        const isBook = req.query.isBook === 'true' ? true : req.query.isBook === 'false' ? false : undefined;
        const condition = req.query.condition ? parseInt(req.query.condition as string, 10) : undefined;
        const sortBy = req.query.sortBy as 'createdAt' | 'price' | 'viewCount' | undefined;
        const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

        // 参数校验
        if (page < 1) {
            sendBadRequest(res, '页码必须大于0');
            return;
        }
        if (pageSize < 1 || pageSize > 100) {
            sendBadRequest(res, '每页数量必须在1-100之间');
            return;
        }

        // 构建查询条件
        const where: any = {};
        
        if (keyword) {
            where[Op.or] = [
                { title: { [Op.like]: `%${keyword}%` } },
                { description: { [Op.like]: `%${keyword}%` } }
            ];
        }
        
        if (categoryId) {
            where.categoryId = categoryId;
        }
        
        if (status !== undefined) {
            where.status = status;
        } else {
            where.status = GoodsStatus.ON_SALE; // 默认查询在售商品
        }
        
        if (minPrice !== undefined) {
            where.price = { ...where.price, [Op.gte]: minPrice };
        }
        
        if (maxPrice !== undefined) {
            where.price = { ...where.price, [Op.lte]: maxPrice };
        }

        if (isBook !== undefined) {
            where.isBook = isBook;
        }

        if (condition !== undefined) {
            where.condition = condition;
        }

        // 构建排序
        const order: any[] = [];
        if (sortBy) {
            order.push([sortBy, sortOrder || 'desc']);
        } else {
            order.push(['createdAt', 'desc']);
        }

        // 查询数据库
        const { count, rows } = await Goods.findAndCountAll({
            where,
            order,
            limit: pageSize,
            offset: (page - 1) * pageSize
        });

        // 获取所有卖家的最新头像
        const sellerIds = [...new Set(rows.map(g => g.sellerId))];
        const sellers = await User.findAll({
            where: { id: sellerIds },
            attributes: ['id', 'username', 'avatar']
        });
        const sellerMap = new Map(sellers.map(s => [s.id, s]));

        // 获取当前用户的收藏状态（可选认证）
        let userCollectedGoodsIds: number[] = [];
        const JWT_SECRET = 'zk-flea-secret-key-2024';
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                const decoded = jwt.verify(token, JWT_SECRET) as { userId?: number };
                if (decoded?.userId) {
                    userCollectedGoodsIds = await getUserCollectGoodsIds(decoded.userId);
                }
            }
        } catch (error) {
            // Token 无效或过期，忽略错误，不影响正常返回商品列表
        }
        const collectedSet = new Set(userCollectedGoodsIds);

        // 格式化返回数据
        const list = rows.map(goods => {
            const seller = sellerMap.get(goods.sellerId);
            return {
                id: goods.id,
                title: goods.title,
                description: goods.description,
                price: goods.price,
                originalPrice: goods.originalPrice,
                images: (goods as any).images,
                categoryId: goods.categoryId,
                categoryName: goods.categoryName,
                sellerId: goods.sellerId,
                sellerName: seller?.username || goods.sellerName,
                sellerAvatar: seller?.avatar || goods.sellerAvatar,
                status: goods.status,
                condition: goods.condition,
                pickupLocation: goods.pickupLocation,
                isBook: goods.isBook,
                viewCount: goods.viewCount,
                favoriteCount: goods.favoriteCount,
                isCollected: collectedSet.has(goods.id),
                createdAt: goods.createdAt.toISOString(),
                updatedAt: goods.updatedAt.toISOString()
            };
        });

        // 返回成功响应
        res.json(successPage(list, count, page, pageSize, '获取商品列表成功'));
    } catch (err) {
        console.error('获取商品列表失败:', err);
        sendServerError(res, '服务器内部错误');
    }
};

/**
 * 获取商品详情
 * GET /api/goods/:id
 */
export const getGoodsDetailHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const idParam = req.params.id;
        const id = typeof idParam === 'string' ? parseInt(idParam, 10) : parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);

        if (isNaN(id)) {
            sendBadRequest(res, '无效的商品ID');
            return;
        }

        const goods = await Goods.findByPk(id, {
            include: [{ model: BookInfo, as: 'bookInfo' }]
        });

        if (!goods) {
            sendNotFound(res, '商品不存在');
            return;
        }

        // 检查用户是否已收藏
        let collected = false;
        const authReq = req as import('../middlewares/auth').AuthRequest;
        if (authReq.user) {
            collected = await isCollected(authReq.user.userId, id);
        }

        // 获取卖家最新信息
        const seller = await User.findByPk(goods.sellerId, {
            attributes: ['id', 'username', 'avatar']
        });

        // 构建返回数据
        const goodsData: any = {
            id: goods.id,
            title: goods.title,
            description: goods.description,
            price: goods.price,
            originalPrice: goods.originalPrice,
            images: (goods as any).images,
            categoryId: goods.categoryId,
            categoryName: goods.categoryName,
            sellerId: goods.sellerId,
            sellerName: seller?.username || goods.sellerName,
            sellerAvatar: seller?.avatar || goods.sellerAvatar,
            status: goods.status,
            condition: goods.condition,
            pickupLocation: goods.pickupLocation,
            isBook: goods.isBook,
            viewCount: goods.viewCount,
            favoriteCount: goods.favoriteCount,
            createdAt: goods.createdAt.toISOString(),
            updatedAt: goods.updatedAt.toISOString(),
            isCollected: collected
        };

        // 如果是图书，添加图书信息
        if ((goods as any).bookInfo) {
            goodsData.bookInfo = {
                isbn: (goods as any).bookInfo.isbn,
                author: (goods as any).bookInfo.author,
                publisher: (goods as any).bookInfo.publisher,
                publishYear: (goods as any).bookInfo.publishYear,
                edition: (goods as any).bookInfo.edition,
                language: (goods as any).bookInfo.language,
                pages: (goods as any).bookInfo.pages
            };
        }

        res.json(success(goodsData, '获取商品详情成功'));
    } catch (err) {
        console.error('获取商品详情失败:', err);
        sendServerError(res, '服务器内部错误');
    }
};

export default {
    getGoodsListHandler,
    getGoodsDetailHandler
};
