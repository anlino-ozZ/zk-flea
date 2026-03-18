/**
 * 商品路由
 * 定义商品相关 API 的路由规则
 */

import { Router } from 'express';
import { getGoodsListHandler, getGoodsDetailHandler } from '../controllers/goodsController';
import { authMiddleware } from '../middlewares/auth';
import { validate, schemas } from '../utils/validator';

// 创建路由实例
const router = Router();

/**
 * GET /api/goods
 * 获取商品列表（支持分页和筛选）- 公开接口
 */
router.get('/', validate(schemas.goodsList, 'query'), getGoodsListHandler);

/**
 * GET /api/goods/:id
 * 获取商品详情 - 需要登录
 */
router.get('/:id', validate(schemas.idParam, 'params'), authMiddleware, getGoodsDetailHandler);

export default router;
