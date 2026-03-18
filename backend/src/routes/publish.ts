/**
 * 商品发布路由
 * 定义商品发布相关 API 的路由规则
 */

import { Router } from 'express';
import { publishGoodsHandler, updateGoodsHandler, deleteGoodsHandler } from '../controllers/publishController';
import { authMiddleware } from '../middlewares/auth';

// 创建路由实例
const router = Router();

/**
 * POST /api/goods/publish
 * 发布商品 - 需要登录
 */
router.post('/publish', authMiddleware, publishGoodsHandler);

/**
 * PUT /api/goods/update/:id
 * 更新商品 - 需要登录
 */
router.put('/update/:id', authMiddleware, updateGoodsHandler);

/**
 * DELETE /api/goods/delete/:id
 * 删除商品 - 需要登录
 */
router.delete('/delete/:id', authMiddleware, deleteGoodsHandler);

export default router;
