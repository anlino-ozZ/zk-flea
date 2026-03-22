import { Response } from 'express';

/**
 * 统一响应结构接口
 */
export interface ApiResponse<T = unknown> {
    code: number;
    msg: string;
    data: T;
}

/**
 * 分页响应结构
 */
export interface PaginatedResponse<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * 成功响应
 * @param data 响应数据
 * @param msg 成功消息
 */
export function success<T>(data: T, msg = '操作成功'): ApiResponse<T> {
    return {
        code: 200,
        msg,
        data
    };
}

/**
 * 成功响应（分页）
 * @param list 数据列表
 * @param total 总数
 * @param page 当前页码
 * @param pageSize 每页数量
 * @param msg 成功消息
 */
export function successPage<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    msg = '操作成功'
): ApiResponse<PaginatedResponse<T>> {
    return {
        code: 200,
        msg,
        data: {
            list,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        }
    };
}

/**
 * 错误响应
 * @param code 错误码
 * @param msg 错误消息
 */
export function error(code: number, msg: string): ApiResponse<null> {
    return {
        code,
        msg,
        data: null
    };
}

/**
 * 常用错误响应快捷方法
 */
export const errors = {
    // 400 - 请求参数错误
    badRequest: (msg = '请求参数错误') => error(400, msg),
    
    // 401 - 未登录
    unauthorized: (msg = '请先登录') => error(401, msg),
    
    // 403 - 没有权限
    forbidden: (msg = '没有权限') => error(403, msg),
    
    // 404 - 资源不存在
    notFound: (msg = '资源不存在') => error(404, msg),
    
    // 409 - 资源冲突
    conflict: (msg = '资源冲突') => error(409, msg),
    
    // 500 - 服务器内部错误
    serverError: (msg = '服务器内部错误') => error(500, msg)
};

/**
 * 发送成功响应
 * @param res Express Response对象
 * @param data 响应数据
 * @param msg 成功消息
 */
export function sendSuccess<T>(res: Response, data: T, msg = '操作成功'): Response {
    return res.status(200).json(success(data, msg));
}

/**
 * 发送分页成功响应
 */
export function sendSuccessPage<T>(
    res: Response,
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    msg = '操作成功'
): Response {
    return res.status(200).json(successPage(list, total, page, pageSize, msg));
}

/**
 * 发送错误响应
 * @param res Express Response对象
 * @param code 错误码
 * @param msg 错误消息
 */
export function sendError(res: Response, code: number, msg: string): Response {
    return res.status(code).json(error(code, msg));
}

/**
 * 发送分页错误响应快捷方法
 */
export function sendBadRequest(res: Response, msg = '请求参数错误'): Response {
    return sendError(res, 400, msg);
}

export function sendUnauthorized(res: Response, msg = '请先登录'): Response {
    return sendError(res, 401, msg);
}

export function sendForbidden(res: Response, msg = '没有权限'): Response {
    return sendError(res, 403, msg);
}

export function sendNotFound(res: Response, msg = '资源不存在'): Response {
    return sendError(res, 404, msg);
}

export function sendConflict(res: Response, msg = '资源冲突'): Response {
    return sendError(res, 409, msg);
}

export function sendServerError(res: Response, msg = '服务器内部错误'): Response {
    return sendError(res, 500, msg);
}
