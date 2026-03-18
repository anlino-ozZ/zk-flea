/**
 * 全局错误处理中间件
 * 捕获所有接口异常，统一返回格式
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// 统一响应结构
interface ApiResponse {
  code: number;
  msg: string;
  data: null;
}

/**
 * 全局错误处理中间件
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 记录错误日志
  logger.error(`[${req.method}] ${req.url}`, {
    error: err.message,
    stack: err.stack,
    body: req.body,
    query: req.query
  });

  // Joi 参数校验错误
  if (err.isJoi || err.name === 'ValidationError') {
    const message = err.details?.[0]?.message || err.message || '参数校验失败';
    const response: ApiResponse = {
      code: 400,
      msg: message.replace(/"/g, ''),
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // JWT 认证错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const response: ApiResponse = {
      code: 401,
      msg: err.name === 'TokenExpiredError' ? '登录已过期，请重新登录' : '无效的token',
      data: null
    };
    res.status(401).json(response);
    return;
  }

  // Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors?.[0]?.message || '数据验证失败';
    const response: ApiResponse = {
      code: 400,
      msg: message,
      data: null
    };
    res.status(400).json(response);
    return;
  }

  // 业务错误（已有 code 属性）
  if (err.code && err.msg) {
    const response: ApiResponse = {
      code: err.code,
      msg: err.msg,
      data: null
    };
    res.status(err.code).json(response);
    return;
  }

  // 系统错误
  const response: ApiResponse = {
    code: 500,
    msg: '服务器内部错误',
    data: null
  };
  res.status(500).json(response);
}

/**
 * 异步路由处理器包装
 * 自动捕获异步函数中的错误
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    code: 404,
    msg: `接口 ${req.method} ${req.url} 不存在`,
    data: null
  } as ApiResponse);
}

export default errorHandler;
