/**
 * 商品控制器
 * 处理商品相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import Goods, { GoodsStatus } from '../models/goods';
import { isCollected, getUserCollectGoodsIds } from '../models/Collect';
import User from '../models/User';

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
function errorResponse(code: number, msg: string): ApiResponse<null> {
  return {
    code,
    msg,
    data: null
  };
}

/**
 * 获取商品列表（支持分页和筛选）
 * GET /api/goods
 */
export const getGoodsListHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // 解析并验证查询参数
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    const keyword = req.query.keyword as string | undefined;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
    const status = req.query.status as string | undefined;
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice as string, 10) : undefined;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined;
    const sortBy = req.query.sortBy as 'createdAt' | 'price' | 'viewCount' | undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

    // 参数校验
    if (page < 1) {
      res.status(400).json(errorResponse(400, '页码必须大于0'));
      return;
    }
    if (pageSize < 1 || pageSize > 100) {
      res.status(400).json(errorResponse(400, '每页数量必须在1-100之间'));
      return;
    }

    // 构建查询条件
    const where: any = {};
    
    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (status) {
      where.status = status;
    } else {
      where.status = GoodsStatus.ON_SALE; // 默认查询在售商品
    }
    
    if (minPrice !== undefined) {
      where.price = { ...where.price, [Op.gte]: minPrice };
    }
    
    if (maxPrice !== undefined) {
      where.price = { ...where.price, [Op.lte]: maxPrice };
    }

    // 构建排序
    const order: any[] = [];
    if (sortBy) {
      order.push([sortBy, sortOrder || 'desc']);
    } else {
      order.push(['createdAt', 'desc']);
    }

    // 查询数据库
    const { count, rows } = await Goods.findAndCountAll({
      where,
      order,
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    // 获取所有卖家的最新头像
    const sellerIds = [...new Set(rows.map(g => g.sellerId))];
    const sellers = await User.findAll({
      where: { id: sellerIds },
      attributes: ['id', 'username', 'avatar']
    });
    const sellerMap = new Map(sellers.map(s => [s.id, s]));

    // 获取当前用户的收藏状态（可选认证）
    let userCollectedGoodsIds: number[] = [];
    const JWT_SECRET = 'zk-flea-secret-key-2024';
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId?: number };
        if (decoded?.userId) {
          userCollectedGoodsIds = await getUserCollectGoodsIds(decoded.userId);
        }
      }
    } catch (error) {
      // Token 无效或过期，忽略错误，不影响正常返回商品列表
    }
    const collectedSet = new Set(userCollectedGoodsIds);

    // 格式化返回数据
    const list = rows.map(goods => {
      const seller = sellerMap.get(goods.sellerId);
      return {
        id: goods.id,
        title: goods.title,
        description: goods.description,
        price: goods.price,
        originalPrice: goods.originalPrice,
        images: (goods as any).images, // 使用 getter 获取数组
        categoryId: goods.categoryId,
        categoryName: goods.categoryName,
        sellerId: goods.sellerId,
        sellerName: seller?.username || goods.sellerName,
        sellerAvatar: seller?.avatar || goods.sellerAvatar,
        status: goods.status,
        viewCount: goods.viewCount,
        favoriteCount: goods.favoriteCount,
        isCollected: collectedSet.has(goods.id), // 添加收藏状态
        createdAt: goods.createdAt.toISOString(),
        updatedAt: goods.updatedAt.toISOString()
      };
    });

    const totalPages = Math.ceil(count / pageSize);

    // 返回成功响应
    res.json(successResponse({
      list,
      total: count,
      page,
      pageSize,
      totalPages
    }, '获取商品列表成功'));
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

/**
 * 获取商品详情
 * GET /api/goods/:id
 */
export const getGoodsDetailHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Express 5.x 中 params 可能是数组，需要确保是字符串
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);

    if (isNaN(id)) {
      res.status(400).json(errorResponse(400, '无效的商品ID'));
      return;
    }

    const goods = await Goods.findByPk(id);

    if (!goods) {
      res.status(404).json(errorResponse(404, '商品不存在'));
      return;
    }

    // 检查用户是否已收藏
    let collected = false;
    const authReq = req as import('../middlewares/auth').AuthRequest;
    if (authReq.user) {
      collected = await isCollected(authReq.user.userId, id);
    }

    // 获取卖家最新信息
    const seller = await User.findByPk(goods.sellerId, {
      attributes: ['id', 'username', 'avatar']
    });

    // 返回商品详情，添加 isCollected 字段
    const goodsWithCollected = {
      id: goods.id,
      title: goods.title,
      description: goods.description,
      price: goods.price,
      originalPrice: goods.originalPrice,
      images: (goods as any).images,
      categoryId: goods.categoryId,
      categoryName: goods.categoryName,
      sellerId: goods.sellerId,
      sellerName: seller?.username || goods.sellerName,
      sellerAvatar: seller?.avatar || goods.sellerAvatar,
      status: goods.status,
      viewCount: goods.viewCount,
      favoriteCount: goods.favoriteCount,
      createdAt: goods.createdAt.toISOString(),
      updatedAt: goods.updatedAt.toISOString(),
      isCollected: collected
    };

    res.json(successResponse(goodsWithCollected, '获取商品详情成功'));
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

export default {
  getGoodsListHandler,
  getGoodsDetailHandler
};
