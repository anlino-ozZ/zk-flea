/**
 * 用户控制器
 * 处理用户相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { generateToken } from '../middlewares/auth';

/**
 * 统一响应结构接口
 */
interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 用户信息类型
 */
interface UserInfo {
  id: number;
  username: string;
  phone: string;
  avatar: string;
  createdAt: string;
}

/**
 * 成功响应
 */
function successResponse<T>(data: T, msg = 'success'): ApiResponse<T> {
  return {
    code: 200,
    msg,
    data
  };
}

/**
 * 错误响应
 */
function errorResponse(code: number, msg: string): ApiResponse {
  return {
    code,
    msg,
    data: null
  };
}

/**
 * 用户注册
 * POST /api/user/register
 */
export const registerHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, phone } = req.body;

    // 参数校验
    if (!username || !password || !phone) {
      res.status(400).json(errorResponse(400, '请填写完整的注册信息'));
      return;
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      res.status(400).json(errorResponse(400, '用户名长度必须在3-20个字符之间'));
      return;
    }

    // 验证密码长度
    if (password.length < 6 || password.length > 20) {
      res.status(400).json(errorResponse(400, '密码长度必须在6-20个字符之间'));
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      res.status(400).json(errorResponse(400, '请输入有效的手机号'));
      return;
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      res.status(400).json(errorResponse(400, '用户名已被注册'));
      return;
    }

    // 检查手机号是否已存在
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      res.status(400).json(errorResponse(400, '手机号已被注册'));
      return;
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const newUser = await User.create({
      username,
      password: hashedPassword,
      phone,
      avatar: `https://picsum.photos/100/100?random=${Date.now()}`
    });

    // 返回用户信息（不含密码）
    const userInfo: UserInfo = {
      id: newUser.id,
      username: newUser.username,
      phone: newUser.phone,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt.toISOString()
    };

    res.status(201).json(successResponse(userInfo, '注册成功'));
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

/**
 * 用户登录
 * POST /api/user/login
 */
export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // 参数校验
    if (!username || !password) {
      res.status(400).json(errorResponse(400, '请输入用户名和密码'));
      return;
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(401).json(errorResponse(401, '用户名或密码错误'));
      return;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json(errorResponse(401, '用户名或密码错误'));
      return;
    }

    // 生成 JWT Token
    const payload = {
      userId: user.id,
      username: user.username
    };
    const token = generateToken(payload);

    // 返回用户信息和 Token
    const userInfo: UserInfo = {
      id: user.id,
      username: user.username,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt.toISOString()
    };

    res.json(successResponse({
      token,
      user: userInfo
    }, '登录成功'));
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

/**
 * 获取当前用户信息
 * GET /api/user/info
 */
export const getUserInfoHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // 从扩展的 Request 对象获取用户信息（由中间件注入）
    const authReq = req as import('../middlewares/auth').AuthRequest;
    const user = authReq.user;

    if (!user) {
      res.status(401).json(errorResponse(401, '未登录'));
      return;
    }

    // 查找用户信息
    const userData = await User.findByPk(user.userId);
    if (!userData) {
      res.status(404).json(errorResponse(404, '用户不存在'));
      return;
    }

    // 返回用户信息（不含密码）
    const userInfo: UserInfo = {
      id: userData.id,
      username: userData.username,
      phone: userData.phone,
      avatar: userData.avatar,
      createdAt: userData.createdAt.toISOString()
    };

    res.json(successResponse(userInfo));
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

/**
 * 更新当前用户信息
 * PUT /api/user/profile
 */
export const updateUserInfoHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // 从扩展的 Request 对象获取用户信息（由中间件注入）
    const authReq = req as import('../middlewares/auth').AuthRequest;
    const user = authReq.user;

    if (!user) {
      res.status(401).json(errorResponse(401, '未登录'));
      return;
    }

    const { phone, avatar } = req.body;

    // 验证手机号格式（如果提供了手机号）
    if (phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        res.status(400).json(errorResponse(400, '请输入有效的手机号'));
        return;
      }

      // 检查手机号是否被其他用户占用
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone && existingPhone.id !== user.userId) {
        res.status(400).json(errorResponse(400, '手机号已被其他用户使用'));
        return;
      }
    }

    // 验证头像URL格式（如果提供了头像）
    if (avatar && !avatar.startsWith('http://') && !avatar.startsWith('https://')) {
      res.status(400).json(errorResponse(400, '头像URL格式不正确'));
      return;
    }

    // 查找并更新用户信息
    const userData = await User.findByPk(user.userId);
    if (!userData) {
      res.status(404).json(errorResponse(404, '用户不存在'));
      return;
    }

    // 更新用户信息
    if (phone) userData.phone = phone;
    if (avatar) userData.avatar = avatar;
    await userData.save();

    // 返回更新后的用户信息（不含密码）
    const userInfo: UserInfo = {
      id: userData.id,
      username: userData.username,
      phone: userData.phone,
      avatar: userData.avatar,
      createdAt: userData.createdAt.toISOString()
    };

    res.json(successResponse(userInfo, '信息更新成功'));
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

export default {
  registerHandler,
  loginHandler,
  getUserInfoHandler,
  updateUserInfoHandler
};
