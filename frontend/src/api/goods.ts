/**
 * 商品 API 封装
 * 与后端商品接口交互的请求函数
 */

import request from '../utils/request';
import type {
  GoodsListParams,
  GoodsListApiResponse,
  Goods,
  ApiResponse
} from '../types/goods';

/**
 * 获取商品列表（支持分页和筛选）
 * @param params - 分页和筛选参数
 * @returns Promise 后端返回的原始响应 { code, msg, data: { list, total, page, pageSize, totalPages } }
 */
export async function getGoodsList(params: GoodsListParams): Promise<GoodsListApiResponse> {
  const response = await request.get<GoodsListApiResponse>('/api/goods', { params });
  return response.data;
}

/**
 * 获取商品详情
 * @param id - 商品ID
 * @returns Promise 后端返回的原始响应 { code, msg, data: Goods }
 */
export async function getGoodsDetail(id: number): Promise<ApiResponse<Goods>> {
  const response = await request.get<ApiResponse<Goods>>(`/api/goods/${id}`);
  return response.data;
}

/**
 * 格式化价格（分转元）
 * @param price - 价格（分）
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number): string {
  return `¥${(price / 100).toFixed(2)}`;
}

export default {
  getGoodsList,
  getGoodsDetail,
  formatPrice
};
