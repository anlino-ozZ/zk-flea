/**
 * 商品卡片组件
 * 展示单个商品信息，支持收藏功能
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tag, Button, message } from 'antd';
import { EyeOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import type { Goods } from '../../types/goods';
import { formatPrice, addCollect, removeCollect } from '../../api/goods';
import { getToken } from '../../api/user';
import './index.css';

interface GoodsCardProps {
  goods: Goods;
  onCollectChange?: (goodsId: number, isCollected: boolean) => void;
  showCollect?: boolean;
}

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

const GoodsCard: React.FC<GoodsCardProps> = ({ goods, onCollectChange, showCollect = true }) => {
  const navigate = useNavigate();
  const [isCollected, setIsCollected] = useState<boolean>(goods.isCollected || false);
  const [loading, setLoading] = useState<boolean>(false);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // 点击卡片跳转到详情页
  const handleClick = () => {
    navigate(`/detail?id=${goods.id}`);
  };

  // 防抖处理收藏操作
  const handleCollect = useCallback(() => {
    const token = getToken();
    if (!token) {
      message.warning('请先登录');
      return;
    }

    // 清除之前的定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // 设置新的防抖定时器
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (isCollected) {
          // 取消收藏
          const res = await removeCollect(goods.id);
          if (res.code === 200) {
            setIsCollected(false);
            message.success('取消收藏成功');
            onCollectChange?.(goods.id, false);
          } else {
            message.error(res.msg || '取消收藏失败');
          }
        } else {
          // 添加收藏
          const res = await addCollect(goods.id);
          if (res.code === 200) {
            setIsCollected(true);
            message.success('收藏成功');
            onCollectChange?.(goods.id, true);
          } else {
            message.error(res.msg || '收藏失败');
          }
        }
      } catch (error) {
        console.error('收藏操作失败:', error);
        message.error('操作失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }, 300);

    setDebounceTimer(timer);
  }, [goods.id, isCollected, debounceTimer, onCollectChange]);

  return (
    <Card
      hoverable
      className="goods-card"
      onClick={handleClick}
      cover={
        <div className="goods-image-container">
          <img
            alt={goods.title}
            src={goods.images[0] || 'https://via.placeholder.com/400x400'}
            className="goods-image"
          />
          <Tag color="green" className="goods-status-tag">
            {goods.categoryName}
          </Tag>
          {showCollect && (
            <Button
              type="primary"
              shape="circle"
              className={`collect-btn ${isCollected ? 'collected' : ''}`}
              icon={isCollected ? <HeartFilled /> : <HeartOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleCollect();
              }}
              loading={loading}
            />
          )}
        </div>
      }
    >
      <Card.Meta
        title={<div className="goods-title">{goods.title}</div>}
        description={
          <div className="goods-info">
            <div className="goods-price">
              <span className="current-price">{formatPrice(goods.price)}</span>
              <span className="original-price">{formatPrice(goods.originalPrice)}</span>
            </div>
            <div className="goods-description">{goods.description}</div>
            <div className="goods-meta">
              <span className="seller">
                <img
                  src={getAvatarUrl(goods.sellerAvatar)}
                  alt={goods.sellerName}
                  className="seller-avatar"
                />
                <span>{goods.sellerName}</span>
              </span>
              <span className="stats">
                <EyeOutlined /> {goods.viewCount}
                <span style={{ marginLeft: 8 }}>
                  {isCollected ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />} {goods.favoriteCount}
                </span>
              </span>
            </div>
          </div>
        }
      />
    </Card>
  );
};

export default GoodsCard;
