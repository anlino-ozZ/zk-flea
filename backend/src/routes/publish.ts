/**
 * 商品发布路由
 * 定义商品发布相关 API 的路由规则
 */

import { Router } from 'express';
import { publishGoodsHandler, updateGoodsHandler, deleteGoodsHandler, getMyGoodsHandler } from '../controllers/publishController';
import { authMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../utils/validator';

// 创建路由实例
const router = Router();

/**
 * GET /api/goods/my
 * 获取当前用户发布的商品列表 - 需要登录
 */
router.get('/my', authMiddleware, getMyGoodsHandler);

/**
 * POST /api/goods/publish
 * 发布商品 - 需要登录
 */
router.post('/publish', authMiddleware, validate(schemas.publishGoods, 'body'), publishGoodsHandler);

/**
 * PUT /api/goods/update/:id
 * 更新商品 - 需要登录
 */
router.put('/update/:id', authMiddleware, validate(schemas.idParam, 'params'), validate(schemas.updateGoods, 'body'), updateGoodsHandler);

/**
 * DELETE /api/goods/delete/:id
 * 删除商品 - 需要登录
 */
router.delete('/delete/:id', authMiddleware, validate(schemas.idParam, 'params'), deleteGoodsHandler);

export default router;
