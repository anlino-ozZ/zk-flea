/**
 * 首页/商品列表页
 * 包含搜索栏、分类金刚区、商品瀑布流列表
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input, Row, Col, Spin, Empty, Skeleton } from 'antd';
import { SearchOutlined, BookOutlined, LaptopOutlined, CarOutlined, HomeOutlined, ShoppingOutlined, GiftOutlined } from '@ant-design/icons';
import type { Goods, GoodsListParams } from '../../types/goods';
import { getGoodsList } from '../../api/goods';
import GoodsCard from '../../components/GoodsCard';
import './index.css';

const { Search } = Input;

const categories = [
  { id: 1, name: '手机数码', icon: <LaptopOutlined />, color: '#1890ff' },
  { id: 2, name: '图书文具', icon: <BookOutlined />, color: '#52c41a' },
  { id: 3, name: '校园代步', icon: <CarOutlined />, color: '#faad14' },
  { id: 4, name: '生活用品', icon: <HomeOutlined />, color: '#eb2f96' },
  { id: 5, name: '潮流服饰', icon: <ShoppingOutlined />, color: '#722ed1' },
  { id: 6, name: '运动出行', icon: <CarOutlined />, color: '#13c2c2' },
  { id: 7, name: '家用电器', icon: <GiftOutlined />, color: '#fa541c' }
];

const SKELETON_COUNT = 8;

const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [goodsList, setGoodsList] = useState<Goods[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [keyword, setKeyword] = useState<string>(searchParams.get('keyword') || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;
  const loadingRef = useRef<boolean>(false);

  const fetchGoodsList = useCallback(async (page: number, isLoadMore = false): Promise<void> => {
    if (page === 1) { setLoading(true); } else { setLoadingMore(true); }
    try {
      const params: GoodsListParams = { page, pageSize, keyword: keyword || undefined, categoryId };
      const response = await getGoodsList(params);
      if (response.code === 200) {
        if (isLoadMore) { setGoodsList(prev => [...prev, ...response.data.list]); }
        else { setGoodsList(response.data.list); }
        setTotal(response.data.total);
        setHasMore(page * pageSize < response.data.total);
      }
    } catch (error) { console.error('获取商品列表失败:', error); }
    finally { setLoading(false); setLoadingMore(false); setInitialLoading(false); loadingRef.current = false; }
  }, [keyword, categoryId]);

  useEffect(() => { fetchGoodsList(1); }, [fetchGoodsList]);

  const handleSearch = (value: string): void => {
    setKeyword(value); setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (value) { newParams.set('keyword', value); } else { newParams.delete('keyword'); }
    newParams.set('page', '1'); setSearchParams(newParams); fetchGoodsList(1, false);
  };

  const handleCategoryClick = (catId: number | undefined): void => {
    setCategoryId(catId); setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (catId) { newParams.set('categoryId', catId.toString()); } else { newParams.delete('categoryId'); }
    newParams.set('page', '1'); setSearchParams(newParams); fetchGoodsList(1, false);
  };

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore || loadingRef.current) return;
    loadingRef.current = true;
    const nextPage = currentPage + 1; setCurrentPage(nextPage); fetchGoodsList(nextPage, true);
  }, [currentPage, loadingMore, hasMore, fetchGoodsList]);

  useEffect(() => {
    const handleScroll = (): void => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      if (scrollTop + clientHeight >= scrollHeight - 200) { handleLoadMore(); }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore]);

  const renderSkeleton = () => (
    <Row gutter={[16, 16]} className="goods-masonry">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <Col key={index} xs={12} sm={8} md={6} lg={4}>
          <div className="skeleton-card">
            <Skeleton.Image active style={{ width: '100%', height: 180 }} />
            <div className="skeleton-content">
              <Skeleton.Input active style={{ width: '80%' }} size="small" />
              <Skeleton.Input active style={{ width: '60%' }} size="small" />
              <Skeleton.Input active style={{ width: '40%' }} size="small" />
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="home-page">
      <div className="home-search-section">
        <div className="search-container">
          <Search placeholder="搜索商品名称或描述" allowClear enterButton={<SearchOutlined />} size="large" value={keyword} onChange={(e) => setKeyword(e.target.value)} onSearch={handleSearch} className="home-search-input" />
        </div>
        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat.id} className={`category-item ${categoryId === cat.id ? 'active' : ''}`} onClick={() => handleCategoryClick(categoryId === cat.id ? undefined : cat.id)}>
              <div className="category-icon" style={{ backgroundColor: cat.color }}>{cat.icon}</div>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
        {(keyword || categoryId) && (
          <div className="filter-tags">
            {keyword && <span className="filter-tag">关键词: {keyword}<span className="tag-close" onClick={() => handleSearch('')}>×</span></span>}
            {categoryId && <span className="filter-tag">分类: {categories.find(c => c.id === categoryId)?.name}<span className="tag-close" onClick={() => handleCategoryClick(undefined)}>×</span></span>}
          </div>
        )}
      </div>
      <div className="home-goods-section">
        {initialLoading ? renderSkeleton() : goodsList.length > 0 ? (
          <>
            <div className="goods-header"><span className="goods-count">共 {total} 件商品</span>{hasMore && <span className="load-more-hint">向下滚动加载更多</span>}</div>
            <Row gutter={[16, 16]} className="goods-masonry">
              {goodsList.map((goods) => (<Col key={goods.id} xs={12} sm={8} md={6} lg={4} xl={4}><GoodsCard goods={goods} /></Col>))}
            </Row>
            {loadingMore && <div className="loading-more"><Spin tip="加载中..." /></div>}
            {!hasMore && goodsList.length > 0 && <div className="no-more"><span>— 已经到底啦 —</span></div>}
          </>
        ) : (<Empty description="暂无商品，快去发布一件吧！" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 64 }} />)}
      </div>
    </div>
  );
};

export default HomePage;
