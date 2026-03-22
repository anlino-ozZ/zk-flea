/**
 * 收藏控制器
 * 处理用户收藏相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { addCollect, removeCollect, isCollected, getUserCollectGoodsIds } from '../models/Collect';
import Goods from '../models/goods';
import BookInfo from '../models/BookInfo';
import { success, error, sendBadRequest, sendNotFound, sendServerError } from '../utils/response';

/**
 * 收藏商品
 * POST /api/collect/add
 */
export const addCollectHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as import('../middlewares/auth').AuthRequest;
        const user = authReq.user;

        if (!user) {
            res.status(401).json(error(401, '请先登录'));
            return;
        }

        const { goodsId } = req.body;

        if (!goodsId) {
            sendBadRequest(res, '请提供商品ID');
            return;
        }

        // 检查商品是否存在
        const goods = await Goods.findByPk(goodsId);
        if (!goods) {
            sendNotFound(res, '商品不存在');
            return;
        }

        // 添加收藏
        const collect = await addCollect(user.userId, goodsId);

        if (!collect) {
            res.status(400).json(error(400, '已收藏该商品'));
            return;
        }

        // 增加商品收藏数
        goods.favoriteCount += 1;
        await goods.save();

        res.json(success({
            id: collect.id,
            userId: collect.userId,
            goodsId: collect.goodsId,
            createdAt: collect.createdAt.toISOString()
        }, '收藏成功'));
    } catch (err) {
        console.error('收藏失败:', err);
        sendServerError(res, '服务器内部错误');
    }
};

/**
 * 取消收藏
 * DELETE /api/collect/remove
 */
export const removeCollectHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as import('../middlewares/auth').AuthRequest;
        const user = authReq.user;

        if (!user) {
            res.status(401).json(error(401, '请先登录'));
            return;
        }

        const { goodsId } = req.body;

        if (!goodsId) {
            sendBadRequest(res, '请提供商品ID');
            return;
        }

        // 取消收藏
        const removed = await removeCollect(user.userId, goodsId);

        if (!removed) {
            res.status(400).json(error(400, '取消收藏失败'));
            return;
        }

        // 减少商品收藏数
        const goods = await Goods.findByPk(goodsId);
        if (goods && goods.favoriteCount > 0) {
            goods.favoriteCount -= 1;
            await goods.save();
        }

        res.json(success(null, '取消收藏成功'));
    } catch (err) {
        console.error('取消收藏失败:', err);
        sendServerError(res, '服务器内部错误');
    }
};

/**
 * 获取用户收藏列表
 * GET /api/collect/list
 */
export const getCollectListHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as import('../middlewares/auth').AuthRequest;
        const user = authReq.user;

        if (!user) {
            res.status(401).json(error(401, '请先登录'));
            return;
        }

        // 获取用户收藏的商品ID列表
        const goodsIds = await getUserCollectGoodsIds(user.userId);

        // 获取商品详情
        const goodsList = await Goods.findAll({
            where: { id: goodsIds },
            include: [{ model: BookInfo, as: 'bookInfo' }]
        });

        // 格式化返回数据
        const result = goodsIds.map(id => {
            const goods = goodsList.find(g => g.id === id);
            if (!goods) return null;
            
            const item: any = {
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
                updatedAt: goods.updatedAt.toISOString(),
                isCollected: true
            };

            // 如果是图书，添加图书信息
            if ((goods as any).bookInfo) {
                item.bookInfo = {
                    isbn: (goods as any).bookInfo.isbn,
                    author: (goods as any).bookInfo.author,
                    publisher: (goods as any).bookInfo.publisher,
                    publishYear: (goods as any).bookInfo.publishYear,
                    edition: (goods as any).bookInfo.edition,
                    language: (goods as any).bookInfo.language,
                    pages: (goods as any).bookInfo.pages
                };
            }

            return item;
        }).filter(goods => goods !== null);

        res.json(success(result, '获取收藏列表成功'));
    } catch (err) {
        console.error('获取收藏列表失败:', err);
        sendServerError(res, '服务器内部错误');
    }
};

/**
 * 检查商品是否已收藏
 * GET /api/collect/check/:goodsId
 */
export const checkCollectHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as import('../middlewares/auth').AuthRequest;
        const user = authReq.user;

        if (!user) {
            res.status(401).json(error(401, '请先登录'));
            return;
        }

        const goodsIdParam = req.params.goodsId;
        const goodsId = typeof goodsIdParam === 'string' ? parseInt(goodsIdParam, 10) : parseInt(Array.isArray(goodsIdParam) ? goodsIdParam[0] : goodsIdParam, 10);

        if (isNaN(goodsId)) {
            sendBadRequest(res, '无效的商品ID');
            return;
        }

        const collected = await isCollected(user.userId, goodsId);

        res.json(success({ collected }));
    } catch (err) {
        console.error('检查收藏状态失败:', err);
        sendServerError(res, '服务器内部错误');
    }
};

export default {
    addCollectHandler,
    removeCollectHandler,
    getCollectListHandler,
    checkCollectHandler
};
