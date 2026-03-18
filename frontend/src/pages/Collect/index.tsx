/**
 * 我的收藏页面
 * 展示用户收藏的商品列表
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { List, Card, Image, Button, Empty, Spin, message, Tag } from 'antd';
import { DeleteOutlined, ShopOutlined } from '@ant-design/icons';
import { getCollectList, removeCollect, formatPrice } from '../../api/goods';
import type { Goods } from '../../types/goods';
import NavBar from '../../components/NavBar';
import './index.css';

// 后端API地址
const API_PROXY = 'http://localhost:3001';

// 处理头像URL
const getAvatarUrl = (avatar: string): string => {
  if (!avatar) return '';
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  return API_PROXY + avatar;
};

const CollectPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [collectList, setCollectList] = useState<Goods[]>([]);

  // 获取收藏列表
  const fetchCollectList = async () => {
    try {
      setLoading(true);
      const res = await getCollectList();
      if (res.code === 200) {
        setCollectList(res.data || []);
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectList();
  }, []);

  // 取消收藏
  const handleRemoveCollect = async (goodsId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await removeCollect(goodsId);
      if (res.code === 200) {
        message.success('已取消收藏');
        setCollectList(prev => prev.filter(item => item.id !== goodsId));
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  // 跳转到商品详情
  const handleClickItem = (goodsId: number) => {
    navigate(`/detail?id=${goodsId}`);
  };

  return (
    <div className="collect-page">
      <NavBar />
      <div className="collect-container">
        <div className="collect-header">
          <h2>
            <ShopOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            我的收藏
          </h2>
          <span className="collect-count">共 {collectList.length} 件商品</span>
        </div>

        {loading ? (
          <div className="collect-loading">
            <Spin size="large" />
          </div>
        ) : collectList.length === 0 ? (
          <Empty
            description="暂无收藏商品"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/goods')}>
              去逛逛
            </Button>
          </Empty>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
            dataSource={collectList}
            renderItem={(item) => (
              <List.Item>
                <Card
                  hoverable
                  className="collect-card"
                  onClick={() => handleClickItem(item.id)}
                  cover={
                    <div className="collect-card-image">
                      <Image
                        src={item.images?.[0] ? API_PROXY + item.images[0] : ''}
                        alt={item.title}
                        style={{ width: '100%', height: 180, objectFit: 'cover' }}
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                      />
                      <Tag color="green" className="collect-card-price">
                        {formatPrice(item.price)}
                      </Tag>
                    </div>
                  }
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => handleRemoveCollect(item.id, e)}
                    >
                      取消收藏
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={<div className="collect-card-title">{item.title}</div>}
                    description={
                      <div className="collect-card-desc">
                        <div className="collect-card-seller">
                          <img
                            src={getAvatarUrl(item.sellerAvatar)}
                            alt={item.sellerName}
                            className="collect-seller-avatar"
                          />
                          <span>{item.sellerName}</span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default CollectPage;
