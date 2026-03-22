/**
 * 商品发布控制器
 * 处理商品发布相关的业务逻辑
 */

import { Request, Response } from 'express';
import Goods, { GoodsStatus, GoodsCondition } from '../models/goods';
import BookInfo from '../models/BookInfo';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';
import { success, error, successPage, sendBadRequest, sendNotFound, sendForbidden, sendServerError } from '../utils/response';

// 辅助函数：解析 query 参数为数字
function parseParamNumber(value: any, defaultValue: number): number {
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'string') return parseInt(value, 10) || defaultValue;
    if (Array.isArray(value) && value.length > 0) return parseInt(value[0], 10) || defaultValue;
    return defaultValue;
}

// 发布商品请求体
interface PublishGoodsBody {
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    images: string[];
    categoryId: number;
    categoryName: string;
    condition?: GoodsCondition;
    pickupLocation?: string;
    isBook?: boolean;
    // 图书特有字段
    isbn?: string;
    author?: string;
    publisher?: string;
    publishYear?: number;
    edition?: string;
    language?: string;
    pages?: number;
}

/**
 * 发布商品
 * POST /api/goods/publish
 */
export async function publishGoodsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { 
            title, description, price, originalPrice, images, categoryId, categoryName,
            condition, pickupLocation, isBook,
            isbn, author, publisher, publishYear, edition, language, pages
        } = req.body as PublishGoodsBody;

        // 参数验证
        if (!title || !description || !price || !originalPrice || !images || images.length === 0 || !categoryId || !categoryName) {
            sendBadRequest(res, '请填写完整的商品信息');
            return;
        }

        // 标题长度限制
        if (title.length > 100) {
            sendBadRequest(res, '商品标题不能超过100字');
            return;
        }

        // 描述长度限制
        if (description.length > 2000) {
            sendBadRequest(res, '商品描述不能超过2000字');
            return;
        }

        // 价格验证
        if (price < 0 || originalPrice < 0) {
            sendBadRequest(res, '价格不能为负数');
            return;
        }

        // 获取用户信息
        let user = await User.findByPk(userId);
        if (!user) {
            // 尝试直接用 SQL 查询
            const [results]: any = await (User as any).sequelize.query(`SELECT * FROM users WHERE id = ${userId}`);
            if (!results || results.length === 0) {
                sendNotFound(res, '用户不存在');
                return;
            }
            user = {
                id: results[0].id,
                username: results[0].username,
                avatar: results[0].avatar || ''
            } as any;
        }

        // 创建商品
        const goods = await Goods.create({
            title: title.trim(),
            description: description.trim(),
            price: Math.round(price),
            originalPrice: Math.round(originalPrice),
            images,
            categoryId,
            categoryName,
            sellerId: userId,
            sellerName: user!.username,
            sellerAvatar: user!.avatar || '',
            status: GoodsStatus.ON_SALE,
            condition: condition || GoodsCondition.LIKE_NEW_4,
            pickupLocation: pickupLocation || '',
            isBook: isBook || false,
            viewCount: 0,
            favoriteCount: 0
        });

        // 如果是图书，创建图书信息
        if (isBook) {
            await BookInfo.create({
                goodsId: goods.id,
                isbn: isbn || '',
                author: author || '',
                publisher: publisher || '',
                publishYear: publishYear || 0,
                edition: edition || '',
                language: language || '中文',
                pages: pages || 0
            });
        }

        res.status(200).json(success({
            id: goods.id,
            title: goods.title,
            status: goods.status
        }, '商品发布成功'));
    } catch (err) {
        console.error('发布商品失败:', err);
        sendServerError(res, '服务器内部错误');
    }
}

/**
 * 更新商品
 * PUT /api/goods/update/:id
 */
export async function updateGoodsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const goodsId = parseParamNumber(req.params.id, 0);
        const { 
            title, description, price, originalPrice, images, categoryId, categoryName, status,
            condition, pickupLocation, isBook,
            isbn, author, publisher, publishYear, edition, language, pages
        } = req.body as Partial<PublishGoodsBody & { status: GoodsStatus }>;

        // 查找商品
        const goods = await Goods.findByPk(goodsId, {
            include: [{ model: BookInfo, as: 'bookInfo' }]
        });
        if (!goods) {
            sendNotFound(res, '商品不存在');
            return;
        }

        // 检查是否为商品所有者
        if (goods.sellerId !== userId) {
            sendForbidden(res, '无权限修改此商品');
            return;
        }

        // 更新商品信息
        if (title) goods.title = title.trim();
        if (description) goods.description = description.trim();
        if (price !== undefined) goods.price = Math.round(price);
        if (originalPrice !== undefined) goods.originalPrice = Math.round(originalPrice);
        if (images && Array.isArray(images) && images.length > 0) goods.images = images as any;
        if (categoryId) goods.categoryId = categoryId;
        if (categoryName) goods.categoryName = categoryName;
        if (status) goods.status = status;
        if (condition) goods.condition = condition;
        if (pickupLocation !== undefined) goods.pickupLocation = pickupLocation;
        if (isBook !== undefined) goods.isBook = isBook;

        await goods.save();

        // 更新图书信息
        if (isBook) {
            const bookInfo = await BookInfo.findOne({ where: { goodsId } });
            if (bookInfo) {
                if (isbn !== undefined) bookInfo.isbn = isbn;
                if (author !== undefined) bookInfo.author = author;
                if (publisher !== undefined) bookInfo.publisher = publisher;
                if (publishYear !== undefined) bookInfo.publishYear = publishYear;
                if (edition !== undefined) bookInfo.edition = edition;
                if (language !== undefined) bookInfo.language = language;
                if (pages !== undefined) bookInfo.pages = pages;
                await bookInfo.save();
            } else {
                // 创建新的图书信息
                await BookInfo.create({
                    goodsId,
                    isbn: isbn || '',
                    author: author || '',
                    publisher: publisher || '',
                    publishYear: publishYear || 0,
                    edition: edition || '',
                    language: language || '中文',
                    pages: pages || 0
                });
            }
        }

        res.status(200).json(success(null, '商品更新成功'));
    } catch (err) {
        console.error('更新商品失败:', err);
        sendServerError(res, '服务器内部错误');
    }
}

/**
 * 删除商品
 * DELETE /api/goods/delete/:id
 */
export async function deleteGoodsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const goodsId = parseParamNumber(req.params.id, 0);

        // 查找商品
        const goods = await Goods.findByPk(goodsId);
        if (!goods) {
            sendNotFound(res, '商品不存在');
            return;
        }

        // 检查是否为商品所有者
        if (goods.sellerId !== userId) {
            sendForbidden(res, '无权限删除此商品');
            return;
        }

        // 删除关联的图书信息
        await BookInfo.destroy({ where: { goodsId } });
        
        await goods.destroy();

        res.status(200).json(success(null, '商品删除成功'));
    } catch (err) {
        console.error('删除商品失败:', err);
        sendServerError(res, '服务器内部错误');
    }
}

/**
 * 获取当前用户发布的商品列表
 * GET /api/goods/my
 */
export async function getMyGoodsHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const page = parseInt(req.query.page as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

        // 获取用户的商品列表
        const { count, rows } = await Goods.findAndCountAll({
            where: { sellerId: userId },
            order: [['createdAt', 'DESC']],
            limit: pageSize,
            offset: (page - 1) * pageSize
        });

        // 格式化返回数据
        const list = rows.map(goods => ({
            id: goods.id,
            title: goods.title,
            description: goods.description,
            price: goods.price,
            originalPrice: goods.originalPrice,
            images: (goods as any).images,
            categoryId: goods.categoryId,
            categoryName: goods.categoryName,
            sellerId: goods.sellerId,
            sellerName: goods.sellerName,
            sellerAvatar: goods.sellerAvatar,
            status: goods.status,
            condition: goods.condition,
            pickupLocation: goods.pickupLocation,
            isBook: goods.isBook,
            viewCount: goods.viewCount,
            favoriteCount: goods.favoriteCount,
            createdAt: goods.createdAt.toISOString(),
            updatedAt: goods.updatedAt.toISOString()
        }));

        res.status(200).json(successPage(list, count, page, pageSize, '获取成功'));
    } catch (err) {
        console.error('获取我的商品列表失败:', err);
        sendServerError(res, '服务器内部错误');
    }
}

export default {
    publishGoodsHandler,
    updateGoodsHandler,
    deleteGoodsHandler,
    getMyGoodsHandler
};
