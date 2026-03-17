/**
 * 收藏控制器
 * 处理用户收藏相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { addCollect, removeCollect, isCollected, getUserCollects, getUserCollectGoodsIds } from '../models/Collect';
import { getGoodsById } from '../models/goods';

/**
 * 统一响应结构接口
 */
interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
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
 * 收藏商品
 * POST /api/collect/add
 * Body参数:
 *   - goodsId: 商品ID
 */
export const addCollectHandler = (req: Request, res: Response): void => {
  try {
    const authReq = req as import('../middlewares/auth').AuthRequest;
    const user = authReq.user;

    if (!user) {
      res.status(401).json(errorResponse(401, '请先登录'));
      return;
    }

    const { goodsId } = req.body;

    if (!goodsId) {
      res.status(400).json(errorResponse(400, '请提供商品ID'));
      return;
    }

    // 检查商品是否存在
    const goods = getGoodsById(goodsId);
    if (!goods) {
      res.status(404).json(errorResponse(404, '商品不存在'));
      return;
    }

    // 添加收藏
    const collect = addCollect(user.userId, goodsId);

    if (!collect) {
      res.status(400).json(errorResponse(400, '已收藏该商品'));
      return;
    }

    res.json(successResponse(collect, '收藏成功'));
  } catch (error) {
    console.error('收藏失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

/**
 * 取消收藏
 * DELETE /api/collect/remove
 * Body参数:
 *   - goodsId: 商品ID
 */
export const removeCollectHandler = (req: Request, res: Response): void => {
  try {
    const authReq = req as import('../middlewares/auth').AuthRequest;
    const user = authReq.user;

    if (!user) {
      res.status(401).json(errorResponse(401, '请先登录'));
      return;
    }

    const { goodsId } = req.body;

    if (!goodsId) {
      res.status(400).json(errorResponse(400, '请提供商品ID'));
      return;
    }

    // 取消收藏
    const removed = removeCollect(user.userId, goodsId);

    if (!removed) {
      res.status(400).json(errorResponse(400, '取消收藏失败'));
      return;
    }

    res.json(successResponse(null, '取消收藏成功'));
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

/**
 * 获取用户收藏列表
 * GET /api/collect/list
 */
export const getCollectListHandler = (req: Request, res: Response): void => {
  try {
    const authReq = req as import('../middlewares/auth').AuthRequest;
    const user = authReq.user;

    if (!user) {
      res.status(401).json(errorResponse(401, '请先登录'));
      return;
    }

    // 获取用户收藏的商品ID列表
    const goodsIds = getUserCollectGoodsIds(user.userId);

    // 获取商品详情
    const goodsList = goodsIds
      .map(id => getGoodsById(id))
      .filter(goods => goods !== null);

    res.json(successResponse(goodsList, '获取收藏列表成功'));
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

/**
 * 检查商品是否已收藏
 * GET /api/collect/check/:goodsId
 */
export const checkCollectHandler = (req: Request, res: Response): void => {
  try {
    const authReq = req as import('../middlewares/auth').AuthRequest;
    const user = authReq.user;

    if (!user) {
      res.status(401).json(errorResponse(401, '请先登录'));
      return;
    }

    const goodsIdParam = req.params.goodsId;
    const goodsId = typeof goodsIdParam === 'string' ? parseInt(goodsIdParam, 10) : parseInt(Array.isArray(goodsIdParam) ? goodsIdParam[0] : goodsIdParam, 10);

    if (isNaN(goodsId)) {
      res.status(400).json(errorResponse(400, '无效的商品ID'));
      return;
    }

    const collected = isCollected(user.userId, goodsId);

    res.json(successResponse({ collected }));
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

export default {
  addCollectHandler,
  removeCollectHandler,
  getCollectListHandler,
  checkCollectHandler
};
