/**
 * 收藏路由
 * 定义收藏相关 API 的路由规则
 */

import { Router } from 'express';
import { addCollectHandler, removeCollectHandler, getCollectListHandler, checkCollectHandler } from '../controllers/collectController';
import { authMiddleware } from '../middlewares/auth';

// 创建路由实例
const router = Router();

/**
 * POST /api/collect/add
 * 收藏商品 - 需要登录
 */
router.post('/add', authMiddleware, addCollectHandler);

/**
 * DELETE /api/collect/remove
 * 取消收藏 - 需要登录
 */
router.delete('/remove', authMiddleware, removeCollectHandler);

/**
 * GET /api/collect/list
 * 获取收藏列表 - 需要登录
 */
router.get('/list', authMiddleware, getCollectListHandler);

/**
 * GET /api/collect/check/:goodsId
 * 检查是否已收藏 - 需要登录
 */
router.get('/check/:goodsId', authMiddleware, checkCollectHandler);

export default router;
