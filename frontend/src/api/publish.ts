/**
 * 商品发布 API 封装
 * 与后端商品发布接口交互的请求函数
 */

import request from '../utils/request';
import type { ApiResponse, GoodsStatus, GoodsCondition } from '../types/goods';

// 发布商品参数
export interface PublishGoodsParams {
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    images: string[];
    categoryId: number;
    categoryName: string;
    condition?: GoodsCondition;
    pickupLocation?: string;
    isBook?: boolean;
    // 图书特有字段
    isbn?: string;
    author?: string;
    publisher?: string;
    publishYear?: number;
    edition?: string;
    language?: string;
    pages?: number;
}

// 更新商品参数
export interface UpdateGoodsParams extends Partial<PublishGoodsParams> {
    status?: GoodsStatus;
}

/**
 * 发布商品
 * @param params - 商品信息
 * @returns Promise
 */
export async function publishGoods(params: PublishGoodsParams): Promise<ApiResponse<{ id: number }>> {
    const response = await request.post<ApiResponse<{ id: number }>>('/api/publish/publish', params);
    return response.data;
}

/**
 * 更新商品
 * @param id - 商品ID
 * @param params - 更新信息
 * @returns Promise
 */
export async function updateGoods(id: number, params: UpdateGoodsParams): Promise<ApiResponse> {
    const response = await request.put<ApiResponse>(`/api/publish/update/${id}`, params);
    return response.data;
}

/**
 * 删除商品
 * @param id - 商品ID
 * @returns Promise
 */
export async function deleteGoods(id: number): Promise<ApiResponse> {
    const response = await request.delete<ApiResponse>(`/api/publish/delete/${id}`);
    return response.data;
}

export default {
    publishGoods,
    updateGoods,
    deleteGoods
};
