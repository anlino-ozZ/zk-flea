/**
 * 留言路由
 * 定义留言相关 API 的路由规则
 */

import { Router } from 'express';
import { addMessageHandler, replyMessageHandler, getMessageListHandler } from '../controllers/messageController';
import { authMiddleware } from '../middlewares/auth';

// 创建路由实例
const router = Router();

/**
 * POST /api/message/add
 * 添加留言 - 需要登录
 */
router.post('/add', authMiddleware, addMessageHandler);

/**
 * POST /api/message/reply
 * 回复留言 - 需要登录
 */
router.post('/reply', authMiddleware, replyMessageHandler);

/**
 * GET /api/message/list
 * 获取商品留言列表 - 公开接口
 * Query: goodsId, page, pageSize
 */
router.get('/list', getMessageListHandler);

export default router;
