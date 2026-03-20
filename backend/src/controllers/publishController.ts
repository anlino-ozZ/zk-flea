/**
 * 商品发布控制器
 * 处理商品发布相关的业务逻辑
 */

import { Request, Response } from 'express';
import Goods, { GoodsStatus } from '../models/goods';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// 统一响应结构
interface ApiResponse<T = unknown> {
    code: number;
    msg: string;
    data: T;
}

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
        console.log('publishGoodsHandler userId:', userId);
        const { title, description, price, originalPrice, images, categoryId, categoryName } = req.body as PublishGoodsBody;

        // 参数验证
        if (!title || !description || !price || !originalPrice || !images || images.length === 0 || !categoryId || !categoryName) {
            res.status(400).json({
                code: 400,
                msg: '请填写完整的商品信息',
                data: null
            } as ApiResponse);
            return;
        }

        // 标题长度限制
        if (title.length > 100) {
            res.status(400).json({
                code: 400,
                msg: '商品标题不能超过100字',
                data: null
            } as ApiResponse);
            return;
        }

        // 描述长度限制
        if (description.length > 2000) {
            res.status(400).json({
                code: 400,
                msg: '商品描述不能超过2000字',
                data: null
            } as ApiResponse);
            return;
        }

        // 价格验证
        if (price < 0 || originalPrice < 0) {
            res.status(400).json({
                code: 400,
                msg: '价格不能为负数',
                data: null
            } as ApiResponse);
            return;
        }

        // 获取用户信息
        let user = await User.findByPk(userId);
        console.log('Found user:', user ? { id: user.id, username: user.username } : null);
        console.log('User tableName:', User.tableName);
        if (!user) {
            // 尝试直接用 SQL 查询
            const [results]: any = await (User as any).sequelize.query(`SELECT * FROM users WHERE id = ${userId}`);
            console.log('Direct SQL results:', results);
            if (!results || results.length === 0) {
                res.status(404).json({
                    code: 404,
                    msg: '用户不存在',
                    data: null
                } as ApiResponse);
                return;
            }
            // 手动构造用户对象
            user = {
                id: results[0].id,
                username: results[0].username,
                avatar: results[0].avatar || ''
            } as any;
        }

        // 提取用户信息，避免后续可能的null类型问题
        const sellerName = user!.username;
        const sellerAvatar = user!.avatar || '';

        // 创建商品
        const goods = await Goods.create({
            title: title.trim(),
            description: description.trim(),
            price: Math.round(price), // 转为分
            originalPrice: Math.round(originalPrice),
            images,
            categoryId,
            categoryName,
            sellerId: userId,
            sellerName: sellerName,
            sellerAvatar: sellerAvatar,
            status: GoodsStatus.ON_SALE,
            viewCount: 0,
            favoriteCount: 0
        });

        res.status(200).json({
            code: 200,
            msg: '商品发布成功',
            data: {
                id: goods.id,
                title: goods.title,
                status: goods.status
            }
        } as ApiResponse);
    } catch (error) {
        console.error('发布商品失败:', error);
        res.status(500).json({
            code: 500,
            msg: '服务器内部错误',
            data: null
        } as ApiResponse);
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
        const { title, description, price, originalPrice, images, categoryId, categoryName, status } = req.body as Partial<PublishGoodsBody & { status: GoodsStatus }>;

        // 查找商品
        const goods = await Goods.findByPk(goodsId);
        if (!goods) {
            res.status(404).json({
                code: 404,
                msg: '商品不存在',
                data: null
            } as ApiResponse);
            return;
        }

        // 检查是否为商品所有者
        if (goods.sellerId !== userId) {
            res.status(403).json({
                code: 403,
                msg: '无权限修改此商品',
                data: null
            } as ApiResponse);
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

        await goods.save();

        res.status(200).json({
            code: 200,
            msg: '商品更新成功',
            data: null
        } as ApiResponse);
    } catch (error) {
        console.error('更新商品失败:', error);
        res.status(500).json({
            code: 500,
            msg: '服务器内部错误',
            data: null
        } as ApiResponse);
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
            res.status(404).json({
                code: 404,
                msg: '商品不存在',
                data: null
            } as ApiResponse);
            return;
        }

        // 检查是否为商品所有者
        if (goods.sellerId !== userId) {
            res.status(403).json({
                code: 403,
                msg: '无权限删除此商品',
                data: null
            } as ApiResponse);
            return;
        }

        await goods.destroy();

        res.status(200).json({
            code: 200,
            msg: '商品删除成功',
            data: null
        } as ApiResponse);
    } catch (error) {
        console.error('删除商品失败:', error);
        res.status(500).json({
            code: 500,
            msg: '服务器内部错误',
            data: null
        } as ApiResponse);
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

        // 获取用户的商品列表
        const goods = await Goods.findAll({
            where: { sellerId: userId },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            code: 200,
            msg: '获取成功',
            data: {
                list: goods,
                total: goods.length
            }
        } as ApiResponse);
    } catch (error) {
        console.error('获取我的商品列表失败:', error);
        res.status(500).json({
            code: 500,
            msg: '服务器内部错误',
            data: null
        } as ApiResponse);
    }
}

export default {
    publishGoodsHandler,
    updateGoodsHandler,
    deleteGoodsHandler,
    getMyGoodsHandler
};
