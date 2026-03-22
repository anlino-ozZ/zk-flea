/**
 * 商品卡片组件
 * 展示单个商品信息，支持收藏功能
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';
import { EyeOutlined, HeartOutlined, HeartFilled, EnvironmentOutlined, BookOutlined } from '@ant-design/icons';
import type { Goods, GoodsCondition } from '../../types/goods';
import { formatPrice, addCollect, removeCollect } from '../../api/goods';
import { getToken } from '../../api/user';
import './index.css';

// 新旧程度标签配置
const conditionLabels: Record<number, string> = {
  1: '全新',
  2: '几乎全新',
  3: '九成新',
  4: '八成新',
  5: '七成新'
};

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

// 处理商品图片URL
const getGoodsImageUrl = (image: string): string => {
  if (!image) return 'https://via.placeholder.com/400x400';
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  return API_PROXY + image;
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

  // 获取第一张图片（去重）
  const rawImages = goods.images || [];
  const imageList = Array.isArray(rawImages) ? [...new Set(rawImages)] : [];
  const mainImage = imageList.length > 0 
    ? getGoodsImageUrl(imageList[0]) 
    : 'https://via.placeholder.com/400x400';

  // 获取新旧程度标签
  const conditionLabel = goods.condition ? conditionLabels[goods.condition] || '八成新' : '八成新';
  
  // 获取自提地点（截取前15个字符）
  const pickupLocationText = goods.pickupLocation?.length > 15 
    ? goods.pickupLocation.substring(0, 15) + '...' 
    : goods.pickupLocation || '';

  return (
    <div className="goods-card-wrapper" onClick={handleClick}>
      <div className="goods-card">
        {/* 图片区域 */}
        <div className="goods-image-container">
          <img
            src={mainImage}
            alt={goods.title}
            className="goods-image"
          />
          {/* 图书标识 */}
          {goods.isBook && (
            <span className="is-book-badge">
              <BookOutlined style={{ marginRight: 4 }} />
              图书
            </span>
          )}
          {/* 分类标签 */}
          <span className="goods-category-tag">
            {goods.categoryName}
          </span>
          {showCollect && (
            <Button
              type="text"
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

        {/* 内容区域 */}
        <div className="goods-card-content">
          <div className="goods-title" title={goods.title}>{goods.title}</div>
          
          <div className="goods-price-row">
            <span className="current-price">{formatPrice(goods.price)}</span>
            {goods.originalPrice > goods.price && (
              <span className="original-price">{formatPrice(goods.originalPrice)}</span>
            )}
          </div>

          {/* 标签行 */}
          <div className="goods-tags-row">
            <span className="condition-tag">{conditionLabel}</span>
            {goods.isBook && goods.bookInfo && (
              <span className="book-tag">{goods.bookInfo.author || '图书'}</span>
            )}
          </div>

          {/* 自提地点 */}
          {pickupLocationText && (
            <div className="pickup-location">
              <EnvironmentOutlined />
              <span>{pickupLocationText}</span>
            </div>
          )}

          <div className="goods-seller-row">
            <div className="seller-info">
              <img
                src={getAvatarUrl(goods.sellerAvatar)}
                alt={goods.sellerName}
                className="seller-avatar"
              />
              <span className="seller-name">{goods.sellerName}</span>
            </div>
            <div className="goods-stats">
              <EyeOutlined />
              <span className="stat-num">{goods.viewCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoodsCard;
