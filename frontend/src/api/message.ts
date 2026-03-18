/**
 * 留言 API 封装
 * 与后端留言接口交互的请求函数
 */

import request from '../utils/request';
import type { ApiResponse } from '../types/goods';

// 留言数据类型
export interface Message {
    id: number;
    userId: number;
    goodsId: number;
    content: string;
    parentId: number | null;
    replyToUserId: number | null;
    createdAt: string;
    user: {
        id: number;
        username: string;
        avatar: string;
    };
    replies?: Message[];
    replyToUsername?: string;
}

// 留言列表响应
export interface MessageListResponse {
    list: Message[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// 留言列表参数
export interface MessageListParams {
    goodsId: number;
    page?: number;
    pageSize?: number;
}

/**
 * 获取商品留言列表
 * @param params - 查询参数
 * @returns Promise
 */
export async function getMessageList(params: MessageListParams): Promise<ApiResponse<MessageListResponse>> {
    const response = await request.get<ApiResponse<MessageListResponse>>('/api/message/list', { params });
    return response.data;
}

/**
 * 添加留言
 * @param goodsId - 商品ID
 * @param content - 留言内容
 * @returns Promise
 */
export async function addMessage(goodsId: number, content: string): Promise<ApiResponse<Message>> {
    const response = await request.post<ApiResponse<Message>>('/api/message/add', { goodsId, content });
    return response.data;
}

/**
 * 回复留言
 * @param goodsId - 商品ID
 * @param content - 回复内容
 * @param parentId - 父留言ID
 * @param replyToUserId - 被回复用户ID
 * @returns Promise
 */
export async function replyMessage(
    goodsId: number,
    content: string,
    parentId: number,
    replyToUserId: number
): Promise<ApiResponse<Message>> {
    const response = await request.post<ApiResponse<Message>>('/api/message/reply', {
        goodsId,
        content,
        parentId,
        replyToUserId
    });
    return response.data;
}

export default {
    getMessageList,
    addMessage,
    replyMessage
};
