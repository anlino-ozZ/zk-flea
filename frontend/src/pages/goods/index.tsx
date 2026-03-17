/**
 * 商品列表页面
 * 展示商品列表，支持分页和筛选
 */

import React, { useState, useEffect } from 'react';
import { Row, Col, Pagination, Input, Select, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Goods, GoodsListParams, GoodsListResponse } from '../../types/goods';
import { getGoodsList } from '../../api/goods';
import GoodsCard from '../../components/GoodsCard';
import './index.css';

const { Option } = Select;

/**
 * 商品列表页面主组件
 */
const GoodsListPage: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState<boolean>(false);
  const [goodsList, setGoodsList] = useState<Goods[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(8);

  // 筛选条件
  const [keyword, setKeyword] = useState<string>('');
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);

  // 分类选项（可从接口获取）
  const categories = [
    { id: 1, name: '手机数码' },
    { id: 2, name: '潮流服饰' },
    { id: 3, name: '游戏动漫' },
    { id: 4, name: '家用电器' },
    { id: 5, name: '图书文具' },
    { id: 6, name: '运动出行' },
    { id: 7, name: '宠物用品' }
  ];

  /**
   * 获取商品列表数据
   */
  const fetchGoodsList = async (): Promise<void> => {
    setLoading(true);
    try {
      const params: GoodsListParams = {
        page: currentPage,
        pageSize,
        keyword: keyword || undefined,
        categoryId
      };

      const response = await getGoodsList(params);

      if (response.code === 200) {
        const data: GoodsListResponse = response.data;
        setGoodsList(data.list);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('获取商品列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载数据
  useEffect(() => {
    fetchGoodsList();
  }, [currentPage, categoryId]);

  // 搜索处理
  const handleSearch = (): void => {
    setCurrentPage(1);
    fetchGoodsList();
  };

  // 分页变化处理
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  // 分类筛选变化处理
  const handleCategoryChange = (value: number | undefined): void => {
    setCategoryId(value);
    setCurrentPage(1);
  };

  return (
    <div className="goods-list-page">
      {/* 筛选区域 */}
      <div className="filter-section">
        <Input.Search
          placeholder="搜索商品名称或描述"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onSearch={handleSearch}
          className="search-input"
        />
        <Select
          placeholder="选择分类"
          allowClear
          size="large"
          onChange={handleCategoryChange}
          value={categoryId}
          className="category-select"
        >
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>
              {cat.name}
            </Option>
          ))}
        </Select>
      </div>

      {/* 商品列表 */}
      <Spin spinning={loading}>
        {goodsList.length > 0 ? (
          <>
            <Row gutter={[16, 16]} className="goods-grid">
              {goodsList.map((goods) => (
                <Col key={goods.id} xs={24} sm={12} md={8} lg={6}>
                  <GoodsCard goods={goods} />
                </Col>
              ))}
            </Row>

            {/* 分页 */}
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 件商品`}
              />
            </div>
          </>
        ) : (
          <Empty
            description="暂无商品"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ marginTop: 64 }}
          />
        )}
      </Spin>
    </div>
  );
};

export default GoodsListPage;
