/**
 * 商品详情页
 * 展示商品详细信息、留言区
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Image, Button, Spin, message, Input, Avatar, Empty, List } from 'antd';
import { HeartOutlined, HeartFilled, UserOutlined, SendOutlined, LeftOutlined, EyeOutlined } from '@ant-design/icons';
import { getGoodsDetail, addCollect, removeCollect, checkCollect } from '../../api/goods';
import { getMessageList, addMessage, replyMessage } from '../../api/message';
import type { Message } from '../../api/message';
import type { Goods } from '../../types/goods';
import './index.css';

const { TextArea } = Input;

// 后端API地址
const API_PROXY = 'http://localhost:3001';

// 处理头像URL，支持本地路径和远程URL
const getAvatarUrl = (avatar: string): string => {
  if (!avatar) return '';
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  return API_PROXY + avatar;
};

// 分页配置
const PAGE_SIZE = 10;

const DetailPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const goodsId = parseInt(searchParams.get('id') || '0', 10);

    // 商品信息
    const [goods, setGoods] = useState<Goods | null>(null);
    const [loading, setLoading] = useState(true);

    // 收藏状态
    const [isCollected, setIsCollected] = useState(false);
    const [collectLoading, setCollectLoading] = useState(false);

    // 留言相关
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageLoading, setMessageLoading] = useState(false);
    const [messageTotal, setMessageTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    // 留言输入
    const [messageContent, setMessageContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 回复状态
    const [replyingTo, setReplyingTo] = useState<{ messageId: number; username: string; userId: number } | null>(null);
    const [replyContent, setReplyContent] = useState('');

    // 获取用户登录状态
    const isLoggedIn = !!localStorage.getItem('token');

    // 加载商品详情
    useEffect(() => {
        if (!goodsId) {
            message.error('商品不存在');
            navigate('/goods');
            return;
        }

        const fetchGoods = async () => {
            try {
                const res = await getGoodsDetail(goodsId);
                if (res.code === 200) {
                    setGoods(res.data);
                    // 检查是否已收藏
                    if (isLoggedIn) {
                        const collectRes = await checkCollect(goodsId);
                        if (collectRes.code === 200) {
                            setIsCollected(collectRes.data.collected);
                        }
                    }
                } else {
                    message.error(res.msg || '获取商品详情失败');
                }
            } catch (error) {
                message.error('获取商品详情失败');
            } finally {
                setLoading(false);
            }
        };

        fetchGoods();
    }, [goodsId, navigate, isLoggedIn]);

    // 加载留言列表
    const loadMessages = useCallback(async (page: number = 1) => {
        setMessageLoading(true);
        try {
            const res = await getMessageList({
                goodsId,
                page,
                pageSize: PAGE_SIZE
            });
            if (res.code === 200) {
                setMessages(res.data.list);
                setMessageTotal(res.data.total);
                setCurrentPage(res.data.page);
            }
        } catch (error) {
            message.error('获取留言失败');
        } finally {
            setMessageLoading(false);
        }
    }, [goodsId]);

    useEffect(() => {
        if (goodsId) {
            loadMessages(1);
        }
    }, [goodsId, loadMessages]);

    // 收藏/取消收藏
    const handleCollect = async () => {
        if (!isLoggedIn) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }

        setCollectLoading(true);
        try {
            const res = isCollected ? await removeCollect(goodsId) : await addCollect(goodsId);
            if (res.code === 200) {
                setIsCollected(!isCollected);
                message.success(isCollected ? '已取消收藏' : '收藏成功');
            } else {
                message.error(res.msg);
            }
        } catch (error) {
            message.error('操作失败');
        } finally {
            setCollectLoading(false);
        }
    };

    // 提交留言
    const handleSubmitMessage = async () => {
        if (!isLoggedIn) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }

        const content = messageContent.trim();
        if (!content) {
            message.warning('请输入留言内容');
            return;
        }

        if (content.length > 200) {
            message.warning('留言内容不能超过200字');
            return;
        }

        setSubmitting(true);
        try {
            const res = await addMessage(goodsId, content);
            if (res.code === 200) {
                message.success('留言成功');
                setMessageContent('');
                loadMessages(1);
            } else {
                message.error(res.msg);
            }
        } catch (error) {
            message.error('提交失败');
        } finally {
            setSubmitting(false);
        }
    };

    // 提交回复
    const handleSubmitReply = async () => {
        if (!isLoggedIn || !replyingTo) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }

        const content = replyContent.trim();
        if (!content) {
            message.warning('请输入回复内容');
            return;
        }

        if (content.length > 200) {
            message.warning('回复内容不能超过200字');
            return;
        }

        setSubmitting(true);
        try {
            const res = await replyMessage(goodsId, content, replyingTo.messageId, replyingTo.userId);
            if (res.code === 200) {
                message.success('回复成功');
                setReplyContent('');
                setReplyingTo(null);
                loadMessages(currentPage);
            } else {
                message.error(res.msg);
            }
        } catch (error) {
            message.error('提交失败');
        } finally {
            setSubmitting(false);
        }
    };

    // 格式化时间
    const formatTime = (timeStr: string) => {
        const date = new Date(timeStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
        return date.toLocaleDateString();
    };

    // 格式化价格
    const formatPrice = (price: number) => `¥${(price / 100).toFixed(2)}`;

    // 格式化日期
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // 当前选中的图片索引
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // 加载更多留言
    const loadMoreMessages = () => {
        loadMessages(currentPage + 1);
    };

    if (loading) {
        return (
            <div className="detail-loading">
                <Spin size="large" />
            </div>
        );
    }

    if (!goods) {
        return (
            <div className="detail-container">
                <Empty description="商品不存在" />
            </div>
        );
    }

    return (
        <div className="detail-container">
            {/* 返回按钮 */}
            <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => navigate(-1)}
                className="detail-back-btn"
            >
                返回
            </Button>

            {/* 商品信息 */}
            <Card className="goods-card">
                <div className="goods-content">
                    <div className="goods-images">
                        {goods.images && goods.images.length > 0 ? (
                            <>
                                <div className="goods-image-wrapper">
                                    <Image
                                        src={goods.images[currentImageIndex]}
                                        alt={goods.title}
                                        className="goods-image"
                                        preview={true}
                                    />
                                </div>
                                {goods.images.length > 1 && (
                                    <div className="goods-thumbnails">
                                        {goods.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`${goods.title} ${idx + 1}`}
                                                className={`goods-thumbnail ${idx === currentImageIndex ? 'active' : ''}`}
                                                onClick={() => setCurrentImageIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="goods-image-placeholder">暂无图片</div>
                        )}
                    </div>
                    <div className="goods-info">
                        <h1 className="goods-title">{goods.title}</h1>
                        <div className="goods-price-row">
                            <div className="goods-price">
                                <span className="current-price">{formatPrice(goods.price)}</span>
                                {goods.originalPrice > goods.price && (
                                    <span className="original-price">{formatPrice(goods.originalPrice)}</span>
                                )}
                            </div>
                            <div className="goods-actions">
                                <Button
                                    className={`collect-btn ${isCollected ? 'collected' : ''}`}
                                    icon={isCollected ? <HeartFilled /> : <HeartOutlined />}
                                    onClick={handleCollect}
                                    loading={collectLoading}
                                >
                                    {isCollected ? '已收藏' : '收藏'}
                                </Button>
                            </div>
                        </div>
                        <div className="goods-meta">
                            <div className="goods-meta-item">
                                <span className="category-tag">{goods.categoryName}</span>
                            </div>
                            <div className="goods-meta-item">
                                <span>发布时间：{formatDate(goods.createdAt)}</span>
                            </div>
                            <div className="goods-meta-item">
                                <EyeOutlined />
                                <span className="stat-value">{goods.viewCount}</span>
                                <span>人浏览</span>
                            </div>
                        </div>
                        <div className="goods-seller">
                            <img
                                src={getAvatarUrl(goods.sellerAvatar)}
                                alt={goods.sellerName}
                                className="seller-avatar"
                            />
                            <div className="seller-info">
                                <span className="seller-name">{goods.sellerName}</span>
                                <span className="seller-address">自提地点：校园内</span>
                            </div>
                            <Button
                                type="primary"
                                className="contact-seller-btn"
                                onClick={() => message.info('请联系卖家沟通交易详情')}
                            >
                                联系卖家
                            </Button>
                        </div>
                        <div className="goods-description">
                            <h3>商品描述</h3>
                            <p>{goods.description || '暂无描述'}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* 移动端底部固定按钮 */}
            <div className="mobile-action-bar">
                <Button
                    type="primary"
                    className="mobile-want-btn"
                    onClick={() => message.info('请联系卖家沟通交易详情')}
                >
                    我想要
                </Button>
            </div>

            {/* 留言区 */}
            <Card className="message-card" title={`留言区 · ${messageTotal}`}>
                {/* 留言输入框 */}
                {isLoggedIn ? (
                    <div className="message-input">
                        <TextArea
                            placeholder="说点什么... (最多200字)"
                            maxLength={200}
                            showCount
                            rows={3}
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                        />
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSubmitMessage}
                            loading={submitting}
                            className="submit-btn"
                        >
                            发表评论
                        </Button>
                    </div>
                ) : (
                    <div className="login-tip">
                        <Button type="link" onClick={() => navigate('/login')}>
                            登录
                        </Button>
                        后参与留言讨论
                    </div>
                )}

                {/* 留言列表 */}
                <div className="message-list">
                    <Spin spinning={messageLoading}>
                        {messages.length > 0 ? (
                            <>
                                <List
                                    dataSource={messages}
                                    renderItem={(item) => (
                                        <List.Item className="message-item">
                                            <div className="message-main">
                                                <Avatar
                                                    src={getAvatarUrl(item.user?.avatar || '')}
                                                    icon={<UserOutlined />}
                                                    className="message-avatar"
                                                />
                                                <div className="message-content-wrap">
                                                    <div className="message-header">
                                                        <span className="username">{item.user?.username}</span>
                                                        <span className="time">{formatTime(item.createdAt)}</span>
                                                    </div>
                                                    <div className="message-text">{item.content}</div>
                                                    <div className="message-actions">
                                                        <Button
                                                            type="link"
                                                            size="small"
                                                            onClick={() => setReplyingTo({
                                                                messageId: item.id,
                                                                username: item.user?.username || '',
                                                                userId: item.user?.id || 0
                                                            })}
                                                        >
                                                            回复
                                                        </Button>
                                                    </div>

                                                    {/* 回复输入框 */}
                                                    {replyingTo?.messageId === item.id && (
                                                        <div className="reply-input">
                                                            <span className="reply-to">@{replyingTo.username}</span>
                                                            <TextArea
                                                                placeholder={`回复 ${replyingTo.username}...`}
                                                                maxLength={200}
                                                                showCount
                                                                rows={2}
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                            />
                                                            <div className="reply-actions">
                                                                <Button size="small" onClick={() => setReplyingTo(null)}>
                                                                    取消
                                                                </Button>
                                                                <Button
                                                                    type="primary"
                                                                    size="small"
                                                                    onClick={handleSubmitReply}
                                                                    loading={submitting}
                                                                >
                                                                    发送
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 回复列表 */}
                                                    {item.replies && item.replies.length > 0 && (
                                                        <div className="replies-list">
                                                            {item.replies.map((reply) => (
                                                                <div key={reply.id} className="reply-item">
                                                                    <Avatar
                                                                        src={reply.user?.avatar}
                                                                        size="small"
                                                                        icon={<UserOutlined />}
                                                                    />
                                                                    <div className="reply-content-wrap">
                                                                        <div className="reply-header">
                                                                            <span className="username">{reply.user?.username}</span>
                                                                            {reply.replyToUsername && (
                                                                                <span className="reply-to">@{reply.replyToUsername}</span>
                                                                            )}
                                                                            <span className="time">{formatTime(reply.createdAt)}</span>
                                                                        </div>
                                                                        <div className="reply-text">{reply.content}</div>
                                                                        <div className="reply-actions">
                                                                            <Button
                                                                                type="link"
                                                                                size="small"
                                                                                onClick={() => setReplyingTo({
                                                                                    messageId: item.id,
                                                                                    username: reply.user?.username || '',
                                                                                    userId: reply.user?.id || 0
                                                                                })}
                                                                            >
                                                                                回复
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                                {/* 加载更多 */}
                                {messages.length < messageTotal && (
                                    <div className="load-more">
                                        <Button onClick={loadMoreMessages} loading={messageLoading}>
                                            加载更多
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <Empty description="暂无留言，快来抢沙发吧~" />
                        )}
                    </Spin>
                </div>
            </Card>
        </div>
    );
};

export default DetailPage;
