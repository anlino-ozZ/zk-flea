/**
 * 留言控制器
 * 处理商品留言相关的业务逻辑
 */

import { Request, Response } from 'express';
import Message, { MessageAttributes, MessageCreationAttributes } from '../models/Message';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth';

// 统一响应结构
interface ApiResponse<T = unknown> {
    code: number;
    msg: string;
    data: T;
}

// 辅助函数：解析 query 参数为数字
function parseQueryNumber(value: any, defaultValue: number): number {
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'string') return parseInt(value, 10) || defaultValue;
    if (Array.isArray(value) && value.length > 0) return parseInt(value[0], 10) || defaultValue;
    return defaultValue;
}

// 留言列表查询参数
interface MessageListQuery {
    goodsId?: number;
    page?: number;
    pageSize?: number;
}

// 留言列表响应
interface MessageListData {
    list: any[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// 用户信息（用于返回给前端）
interface UserInfo {
    id: number;
    username: string;
    avatar: string;
}

// 留言信息（包含用户信息和回复）
interface MessageWithUser extends MessageAttributes {
    user: UserInfo;
    replies?: MessageWithUser[];
    replyToUsername?: string;
}

/**
 * 添加留言
 * POST /api/message/add
 */
export async function addMessageHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { goodsId, content } = req.body;

        // 参数验证
        if (!goodsId || !content) {
            res.status(400).json({
                code: 400,
                msg: '参数不完整',
                data: null
            } as ApiResponse);
            return;
        }

        // 字数限制
        if (content.length > 200) {
            res.status(400).json({
                code: 400,
                msg: '留言内容不能超过200字',
                data: null
            } as ApiResponse);
            return;
        }

        // 创建留言
        const message = await Message.create({
            userId,
            goodsId: parseInt(goodsId, 10),
            content: content.trim(),
            parentId: null,
            replyToUserId: null
        } as MessageCreationAttributes);

        // 获取用户信息
        const user = await User.findByPk(userId, {
            attributes: ['id', 'username', 'avatar']
        });

        res.status(200).json({
            code: 200,
            msg: '留言成功',
            data: {
                id: message.id,
                userId: message.userId,
                goodsId: message.goodsId,
                content: message.content,
                parentId: message.parentId,
                replyToUserId: message.replyToUserId,
                createdAt: message.createdAt,
                user: {
                    id: user?.id,
                    username: user?.username,
                    avatar: user?.avatar
                }
            }
        } as ApiResponse);
    } catch (error) {
        console.error('添加留言失败:', error);
        res.status(500).json({
            code: 500,
            msg: '服务器内部错误',
            data: null
        } as ApiResponse);
    }
}

/**
 * 回复留言
 * POST /api/message/reply
 */
export async function replyMessageHandler(
    req: AuthRequest,
    res: Response
): Promise<void> {
    try {
        const userId = req.user!.userId;
        const { goodsId, content, parentId, replyToUserId } = req.body;

        // 参数验证
        if (!goodsId || !content || !parentId || !replyToUserId) {
            res.status(400).json({
                code: 400,
                msg: '参数不完整',
                data: null
            } as ApiResponse);
            return;
        }

        // 字数限制
        if (content.length > 200) {
            res.status(400).json({
                code: 400,
                msg: '回复内容不能超过200字',
                data: null
            } as ApiResponse);
            return;
        }

        // 不能回复自己的留言
        if (userId === replyToUserId) {
            res.status(400).json({
                code: 400,
                msg: '不能回复自己的留言',
                data: null
            } as ApiResponse);
            return;
        }

        // 检查父留言是否存在
        const parentMessage = await Message.findByPk(parentId);
        if (!parentMessage) {
            res.status(404).json({
                code: 404,
                msg: '父留言不存在',
                data: null
            } as ApiResponse);
            return;
        }

        // 创建回复
        const message = await Message.create({
            userId,
            goodsId: parseInt(goodsId, 10),
            content: content.trim(),
            parentId: parseInt(parentId, 10),
            replyToUserId: parseInt(replyToUserId, 10)
        } as MessageCreationAttributes);

        // 获取当前用户和被回复用户信息
        const [user, replyToUser] = await Promise.all([
            User.findByPk(userId, { attributes: ['id', 'username', 'avatar'] }),
            User.findByPk(replyToUserId, { attributes: ['id', 'username', 'avatar'] })
        ]);

        res.status(200).json({
            code: 200,
            msg: '回复成功',
            data: {
                id: message.id,
                userId: message.userId,
                goodsId: message.goodsId,
                content: message.content,
                parentId: message.parentId,
                replyToUserId: message.replyToUserId,
                createdAt: message.createdAt,
                user: {
                    id: user?.id,
                    username: user?.username,
                    avatar: user?.avatar
                },
                replyToUsername: replyToUser?.username
            }
        } as ApiResponse);
    } catch (error) {
        console.error('回复留言失败:', error);
        res.status(500).json({
            code: 500,
            msg: '服务器内部错误',
            data: null
        } as ApiResponse);
    }
}

/**
 * 获取商品留言列表
 * GET /api/message/list?goodsId=xxx&page=1&pageSize=10
 */
export async function getMessageListHandler(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const goodsIdParam = req.query.goodsId;
        const pageParam = req.query.page || 1;
        const pageSizeParam = req.query.pageSize || 10;

        if (!goodsIdParam) {
            res.status(400).json({
                code: 400,
                msg: '缺少商品ID',
                data: null
            } as ApiResponse);
            return;
        }

        const goodsId = parseQueryNumber(goodsIdParam, 0);
        const page = parseQueryNumber(pageParam, 1);
        const pageSize = parseQueryNumber(pageSizeParam, 10);

        // 获取顶层留言（parentId为null）
        const { count, rows: topMessages } = await Message.findAndCountAll({
            where: {
                goodsId,
                parentId: null
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'avatar']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: pageSize,
            offset: (page - 1) * pageSize,
            distinct: true
        });

        // 获取所有顶层留言ID
        const topMessageIds = topMessages.map(m => m.id);

        // 获取所有回复（顶层留言的回复）
        let replies: Message[] = [];
        if (topMessageIds.length > 0) {
            replies = await Message.findAll({
                where: {
                    parentId: topMessageIds
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'avatar']
                    }
                ],
                order: [['createdAt', 'ASC']]
            });
        }

        // 构建用户ID到用户名的映射
        const userIds = new Set<number>();
        topMessages.forEach(m => userIds.add(m.userId));
        replies.forEach(r => {
            userIds.add(r.userId);
            if (r.replyToUserId) userIds.add(r.replyToUserId);
        });

        const users = await User.findAll({
            where: {
                id: Array.from(userIds)
            },
            attributes: ['id', 'username', 'avatar']
        });

        const userMap = new Map(users.map(u => [u.id, { id: u.id, username: u.username, avatar: u.avatar }]));

        // 构建留言树
        const replyMap = new Map<number, any[]>();
        replies.forEach(r => {
            const repliesList = replyMap.get(r.parentId!) || [];
            repliesList.push({
                id: r.id,
                userId: r.userId,
                goodsId: r.goodsId,
                content: r.content,
                parentId: r.parentId,
                replyToUserId: r.replyToUserId,
                createdAt: r.createdAt,
                user: userMap.get(r.userId),
                replyToUsername: r.replyToUserId ? userMap.get(r.replyToUserId)?.username : null
            });
            replyMap.set(r.parentId!, repliesList);
        });

        // 组装返回数据
        const list = topMessages.map(m => ({
            id: m.id,
            userId: m.userId,
            goodsId: m.goodsId,
            content: m.content,
            parentId: m.parentId,
            replyToUserId: m.replyToUserId,
            createdAt: m.createdAt,
            user: (m as any).user ? {
                id: (m as any).user.id,
                username: (m as any).user.username,
                avatar: (m as any).user.avatar
            } : null,
            replies: replyMap.get(m.id) || []
        }));

        res.status(200).json({
            code: 200,
            msg: '获取成功',
            data: {
                list,
                total: count,
                page,
                pageSize,
                totalPages: Math.ceil(count / pageSize)
            }
        } as ApiResponse<MessageListData>);
    } catch (error) {
        console.error('获取留言列表失败:', error);
        res.status(500).json({
            code: 500,
            msg: '服务器内部错误',
            data: null
        } as ApiResponse);
    }
}

export default {
    addMessageHandler,
    replyMessageHandler,
    getMessageListHandler
};
