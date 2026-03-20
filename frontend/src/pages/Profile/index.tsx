/**
 * 个人中心页面 - Web端左侧边栏布局
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Typography,
  Spin,
  Empty
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShopOutlined,
  HeartOutlined,
  RightOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserInfoFromStorage, updateUserInfo as updateUserInfoApi, setUserInfo, removeToken, removeUserInfo } from '../../api/user';
import { getMyGoods, getMyCollect, formatPrice } from '../../api/goods';
import type { UserInfo } from '../../types/user';
import type { Goods } from '../../types/goods';
import './index.css';

const { Title, Text } = Typography;

interface ProfileFormValues {
  phone: string;
  avatar: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(getUserInfoFromStorage());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<ProfileFormValues>();

  // 标签页状态
  const [activeTab, setActiveTab] = useState<'publish' | 'collect' | 'settings'>('publish');

  // 商品数据
  const [myGoods, setMyGoods] = useState<Goods[]>([]);
  const [myCollects, setMyCollects] = useState<Goods[]>([]);
  const [goodsLoading, setGoodsLoading] = useState(false);
  const [collectLoading, setCollectLoading] = useState(false);

  // 加载我的发布
  const loadMyGoods = async (): Promise<void> => {
    setGoodsLoading(true);
    try {
      const res = await getMyGoods();
      if (res.code === 200 && res.data) {
        const data = res.data as unknown as any[];
        setMyGoods(Array.isArray(data) ? data : (data.list || []));
      }
    } catch (error) {
      console.error('加载我的发布失败:', error);
    } finally {
      setGoodsLoading(false);
    }
  };

  // 加载我的收藏
  const loadMyCollects = async (): Promise<void> => {
    setCollectLoading(true);
    try {
      const res = await getMyCollect();
      if (res.code === 200 && res.data) {
        const data = res.data as unknown as any[];
        setMyCollects(Array.isArray(data) ? data : (data.list || []));
      }
    } catch (error) {
      console.error('加载我的收藏失败:', error);
    } finally {
      setCollectLoading(false);
    }
  };

  // 切换标签页时加载数据
  useEffect(() => {
    if (activeTab === 'publish') {
      loadMyGoods();
    } else if (activeTab === 'collect') {
      loadMyCollects();
    }
  }, [activeTab]);

  // 刷新用户信息
  const refreshUserInfo = (): void => {
    const info = getUserInfoFromStorage();
    setUserInfoState(info);
  };

  // 格式化注册时间
  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 格式化发布时间
  const formatTime = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return days + '天前';
    return date.toLocaleDateString('zh-CN');
  };

  // 打开编辑弹窗
  const handleEditClick = (): void => {
    if (userInfo) {
      form.setFieldsValue({
        phone: userInfo.phone,
        avatar: userInfo.avatar
      });
    }
    setIsModalVisible(true);
  };

  // 提交修改
  const handleSubmit = async (values: ProfileFormValues): Promise<void> => {
    setLoading(true);
    try {
      const response = await updateUserInfoApi({
        phone: values.phone,
        avatar: values.avatar
      });

      if (response.code === 200) {
        message.success('信息更新成功');
        setUserInfo(response.data);
        refreshUserInfo();
        setIsModalVisible(false);
      } else {
        message.error(response.msg || '更新失败');
      }
    } catch (error: any) {
      console.error('更新用户信息失败:', error);
      message.error(error.response?.data?.msg || '更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 退出登录
  const handleLogout = (): void => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        removeToken();
        removeUserInfo();
        message.success('已退出登录');
        navigate('/login');
      }
    });
  };

  // 去发布商品
  const handleGoPublish = (): void => {
    navigate('/publish');
  };

  // 去商品详情
  const handleGoToDetail = (id: number): void => {
    navigate('/detail/' + id);
  };

  // 渲染侧边栏
  const renderSidebar = () => (
    <div className="profile-sidebar">
      {/* 用户信息卡片 */}
      <Card className="sidebar-user-card">
        <div className="sidebar-user-info">
          <Avatar
            size={80}
            src={userInfo?.avatar}
            icon={<UserOutlined />}
            className="sidebar-avatar"
          />
          <Title level={4} className="sidebar-username">
            {userInfo?.username}
          </Title>
          <Text type="secondary" className="sidebar-phone">
            {userInfo?.phone}
          </Text>
        </div>
        <div className="sidebar-user-extra">
          <div className="user-stat-item">
            <span className="stat-num">{myGoods.length}</span>
            <span className="stat-text">发布</span>
          </div>
          <div className="user-stat-divider" />
          <div className="user-stat-item">
            <span className="stat-num">{myCollects.length}</span>
            <span className="stat-text">收藏</span>
          </div>
        </div>
      </Card>

      {/* 导航菜单 */}
      <Card className="sidebar-menu-card">
        <div
          className={'menu-item ' + (activeTab === 'publish' ? 'active' : '')}
          onClick={() => setActiveTab('publish')}
        >
          <ShopOutlined className="menu-icon" />
          <span>我的发布</span>
          <RightOutlined className="menu-arrow" />
        </div>
        <div
          className={'menu-item ' + (activeTab === 'collect' ? 'active' : '')}
          onClick={() => setActiveTab('collect')}
        >
          <HeartOutlined className="menu-icon" />
          <span>我的收藏</span>
          <RightOutlined className="menu-arrow" />
        </div>
        <div
          className={'menu-item ' + (activeTab === 'settings' ? 'active' : '')}
          onClick={() => setActiveTab('settings')}
        >
          <SettingOutlined className="menu-icon" />
          <span>账号设置</span>
          <RightOutlined className="menu-arrow" />
        </div>
      </Card>

      {/* 快捷操作 */}
      <Card className="sidebar-action-card">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="action-button primary"
          onClick={handleGoPublish}
        >
          发布商品
        </Button>
        <Button
          icon={<EditOutlined />}
          className="action-button"
          onClick={handleEditClick}
        >
          修改资料
        </Button>
        <Button
          danger
          icon={<LogoutOutlined />}
          className="action-button danger"
          onClick={handleLogout}
        >
          退出登录
        </Button>
      </Card>
    </div>
  );

  // 渲染发布内容
  const renderPublishContent = () => (
    <div className="content-area">
      <div className="content-header">
        <Title level={4} className="content-title">我的发布</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleGoPublish}>
          发布新商品
        </Button>
      </div>

      {goodsLoading ? (
        <div className="loading-wrap">
          <Spin size="large" />
        </div>
      ) : myGoods.length === 0 ? (
        <div className="empty-wrap">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无发布的商品"
          >
            <Button type="primary" onClick={handleGoPublish}>
              发布第一个商品
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="product-list">
          {myGoods.map((item) => (
            <div
              key={item.id}
              className="product-item"
              onClick={() => handleGoToDetail(item.id)}
            >
              <div className="product-image">
                <img
                  src={item.images && item.images[0] ? item.images[0] : 'https://via.placeholder.com/120x90'}
                  alt={item.title}
                />
              </div>
              <div className="product-info">
                <div>
                  <Text className="product-title">{item.title}</Text>
                  <Text type="secondary" className="product-desc">
                    {item.description || '暂无描述'}
                  </Text>
                </div>
                <div className="product-meta">
                  <Text className="product-price">{formatPrice(item.price)}</Text>
                  <Text type="secondary" className="product-time">
                    {formatTime(item.createdAt)}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 渲染收藏内容
  const renderCollectContent = () => (
    <div className="content-area">
      <div className="content-header">
        <Title level={4} className="content-title">我的收藏</Title>
      </div>

      {collectLoading ? (
        <div className="loading-wrap">
          <Spin size="large" />
        </div>
      ) : myCollects.length === 0 ? (
        <div className="empty-wrap">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无收藏的商品"
          >
            <Button type="primary" onClick={() => navigate('/')}>
              去逛逛
            </Button>
          </Empty>
        </div>
      ) : (
        <div className="product-list">
          {myCollects.map((item) => (
            <div
              key={item.id}
              className="product-item"
              onClick={() => handleGoToDetail(item.id)}
            >
              <div className="product-image">
                <img
                  src={item.images && item.images[0] ? item.images[0] : 'https://via.placeholder.com/120x90'}
                  alt={item.title}
                />
              </div>
              <div className="product-info">
                <div>
                  <Text className="product-title">{item.title}</Text>
                  <Text type="secondary" className="product-desc">
                    {item.description || '暂无描述'}
                  </Text>
                </div>
                <div className="product-meta">
                  <Text className="product-price">{formatPrice(item.price)}</Text>
                  <Text type="secondary" className="product-time">
                    {formatTime(item.createdAt)}
                  </Text>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // 渲染设置内容
  const renderSettingsContent = () => (
    <div className="content-area">
      <div className="content-header">
        <Title level={4} className="content-title">账号设置</Title>
      </div>

      <Card className="settings-card">
        <div className="settings-group">
          <Text className="settings-label">头像</Text>
          <Avatar src={userInfo?.avatar} size={60} icon={<UserOutlined />} />
        </div>
        <div className="settings-group">
          <Text className="settings-label">用户名</Text>
          <Text className="settings-value">{userInfo?.username}</Text>
        </div>
        <div className="settings-group">
          <Text className="settings-label">手机号</Text>
          <Text className="settings-value">{userInfo?.phone}</Text>
        </div>
        <div className="settings-group">
          <Text className="settings-label">注册时间</Text>
          <Text className="settings-value">{formatDate(userInfo?.createdAt || '')}</Text>
        </div>
        <div className="settings-actions">
          <Button type="primary" icon={<EditOutlined />} onClick={handleEditClick}>
            修改资料
          </Button>
        </div>
      </Card>
    </div>
  );

  // 如果未登录
  if (!userInfo) {
    return (
      <div className="not-login-wrap">
        <Card className="not-login-card">
          <UserOutlined className="not-login-icon" />
          <Title level={4}>请先登录</Title>
          <Text type="secondary">登录后可查看个人中心</Text>
          <Button
            type="primary"
            size="large"
            className="login-btn"
            onClick={() => navigate('/login')}
          >
            去登录
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-layout">
        {renderSidebar()}
        <div className="profile-main">
          <Card className="main-content-card">
            {activeTab === 'publish' && renderPublishContent()}
            {activeTab === 'collect' && renderCollectContent()}
            {activeTab === 'settings' && renderSettingsContent()}
          </Card>
        </div>
      </div>

      {/* 修改资料弹窗 */}
      <Modal
        title="修改个人资料"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={400}
        className="edit-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input
              placeholder="请输入手机号"
              maxLength={11}
              prefix={<PhoneOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="头像URL"
            name="avatar"
            rules={[
              { required: true, message: '请输入头像URL' },
              { type: 'url', message: '请输入有效的URL' }
            ]}
          >
            <Input placeholder="https://example.com/avatar.jpg" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
