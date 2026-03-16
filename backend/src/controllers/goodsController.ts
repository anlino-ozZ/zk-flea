/**
 * 商品控制器
 * 处理商品相关的 HTTP 请求
 */

import { Request, Response } from 'express';
import { getGoodsList, getGoodsById, GoodsStatus } from '../models/goods';

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
 * Query参数:
 *   - page: 页码，默认1
 *   - pageSize: 每页数量，默认10
 *   - keyword: 搜索关键词
 *   - categoryId: 分类ID
 *   - status: 商品状态
 *   - minPrice: 最低价格
 *   - maxPrice: 最高价格
 *   - sortBy: 排序字段（createdAt/price/viewCount）
 *   - sortOrder: 排序方向（asc/desc）
 */
export const getGoodsListHandler = (req: Request, res: Response): void => {
  try {
    // 解析并验证查询参数
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    const keyword = req.query.keyword as string | undefined;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
    const status = req.query.status as GoodsStatus | undefined;
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

    // 调用模型层获取数据
    const result = getGoodsList({
      page,
      pageSize,
      keyword,
      categoryId,
      status,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder
    });

    // 返回成功响应
    res.json(successResponse(result, '获取商品列表成功'));
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

/**
 * 获取商品详情
 * GET /api/goods/:id
 * Path参数:
 *   - id: 商品ID
 */
export const getGoodsDetailHandler = (req: Request, res: Response): void => {
  try {
    // Express 5.x 中 params 可能是数组，需要确保是字符串
    const idParam = req.params.id;
    const id = typeof idParam === 'string' ? parseInt(idParam, 10) : parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);

    if (isNaN(id)) {
      res.status(400).json(errorResponse(400, '无效的商品ID'));
      return;
    }

    const goods = getGoodsById(id);

    if (!goods) {
      res.status(404).json(errorResponse(404, '商品不存在'));
      return;
    }

    res.json(successResponse(goods, '获取商品详情成功'));
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json(errorResponse(500, '服务器内部错误'));
  }
};

export default {
  getGoodsListHandler,
  getGoodsDetailHandler
};
