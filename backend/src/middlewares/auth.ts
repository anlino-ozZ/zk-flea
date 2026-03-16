/**
 * 鉴权中间件
 * 验证 JWT Token 有效性
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../models/User';

// JWT 密钥（生产环境应从环境变量获取）
const JWT_SECRET = 'zk-flea-secret-key-2024';

/**
 * 统一响应结构接口
 */
interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 扩展 Request 类型，包含用户信息
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * 验证 Token 的中间件
 * - 检查请求头中是否包含 Authorization 字段
 * - 验证 Token 格式和有效性
 * - 将解析出的用户信息挂载到 req.user
 */
export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // 从请求头获取 Token（格式: Bearer <token>）
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        code: 401,
        msg: '未提供认证令牌',
        data: null
      } as ApiResponse);
      return;
    }

    // 解析 Bearer Token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        code: 401,
        msg: '令牌格式无效，应为: Bearer <token>',
        data: null
      } as ApiResponse);
      return;
    }

    const token = parts[1];

    // 验证 Token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 将用户信息挂载到请求对象
    req.user = decoded;

    // 继续处理下一个中间件
    next();
  } catch (error) {
    // Token 验证失败
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        code: 401,
        msg: '令牌已过期，请重新登录',
        data: null
      } as ApiResponse);
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        code: 401,
        msg: '令牌无效',
        data: null
      } as ApiResponse);
      return;
    }

    // 其他错误
    res.status(500).json({
      code: 500,
      msg: '服务器内部错误',
      data: null
    } as ApiResponse);
  }
}

/**
 * 生成 JWT Token
 * @param payload 要编码的用户信息
 * @returns 生成的 Token 字符串
 */
export function generateToken(payload: JwtPayload): string {
  // Token 过期时间: 7 天
  const expiresIn = '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export default {
  authMiddleware,
  generateToken
};
