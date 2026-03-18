/**
 * 用户路由
 * 定义用户相关 API 的路由规则
 */

import { Router } from 'express';
import { registerHandler, loginHandler, getUserInfoHandler, updateUserInfoHandler, uploadAvatarHandler } from '../controllers/userController';
import { authMiddleware } from '../middlewares/auth';

// 创建路由实例
const router = Router();

/**
 * POST /api/user/register
 * 用户注册
 */
router.post('/register', registerHandler);

/**
 * POST /api/user/login
 * 用户登录
 */
router.post('/login', loginHandler);

/**
 * GET /api/user/info
 * 获取当前用户信息（需要登录）
 */
router.get('/info', authMiddleware, getUserInfoHandler);

/**
 * PUT /api/user/profile
 * 更新当前用户信息（需要登录）
 */
router.put('/profile', authMiddleware, updateUserInfoHandler);

/**
 * POST /api/user/avatar
 * 上传头像（需要登录）
 */
router.post('/avatar', authMiddleware, uploadAvatarHandler);

export default router;
