/**
 * 收藏路由
 * 定义收藏相关 API 的路由规则
 */

import { Router } from 'express';
import { addCollectHandler, removeCollectHandler, getCollectListHandler, checkCollectHandler } from '../controllers/collectController';
import { authMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../utils/validator';

// 创建路由实例
const router = Router();

/**
 * POST /api/collect/add
 * 收藏商品 - 需要登录
 */
router.post('/add', authMiddleware, validate(schemas.collect, 'body'), addCollectHandler);

/**
 * DELETE /api/collect/remove
 * 取消收藏 - 需要登录
 */
router.delete('/remove', authMiddleware, validate(schemas.collect, 'body'), removeCollectHandler);

/**
 * GET /api/collect/list
 * 获取收藏列表 - 需要登录
 */
router.get('/list', authMiddleware, validate(schemas.collectList, 'query'), getCollectListHandler);

/**
 * GET /api/collect/check/:goodsId
 * 检查是否已收藏 - 需要登录
 */
router.get('/check/:goodsId', authMiddleware, validate(schemas.goodsIdParam, 'params'), checkCollectHandler);

export default router;
