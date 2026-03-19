/**
 * 绿色系导航栏组件
 * 包含 Logo、导航菜单、用户头像/登录按钮
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Button, Drawer } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  PlusOutlined,
  UserOutlined,
  HeartOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { getUserInfoFromStorage, getToken, removeToken, removeUserInfo } from '../../api/user';
import './index.css';

const { Header } = Layout;

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

// 导航菜单配置
const menuItems = [
  {
    key: '/',
    label: <Link to="/">首页</Link>,
    icon: <HomeOutlined />,
  },
  {
    key: '/goods',
    label: <Link to="/goods">商品列表</Link>,
    icon: <AppstoreOutlined />,
  },
  {
    key: '/publish',
    label: <Link to="/publish">发布商品</Link>,
    icon: <PlusOutlined />,
  },
];

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const userInfo = getUserInfoFromStorage();
  const token = getToken();
  const isLoggedIn = !!token;

  // 获取当前选中的菜单项
  const getSelectedKey = (): string => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return '/';
    if (path.startsWith('/goods')) return '/goods';
    if (path.startsWith('/publish')) return '/publish';
    if (path.startsWith('/profile')) return '/profile';
    if (path.startsWith('/collect')) return '/collect';
    return '/';
  };

  // 处理退出登录
  const handleLogout = (): void => {
    removeToken();
    removeUserInfo();
    navigate('/login');
    setMobileMenuVisible(false);
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">个人中心</Link>,
    },
    {
      key: 'collect',
      icon: <HeartOutlined />,
      label: <Link to="/collect">我的收藏</Link>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // 渲染PC端导航
  const renderPCNav = () => (
    <>
      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/">校园二手集市</Link>
      </div>

      {/* 导航菜单 */}
      <Menu
        mode="horizontal"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        className="navbar-menu"
      />

      {/* 右侧用户区域 */}
      <div className="navbar-user">
        {isLoggedIn ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div className="navbar-user-info">
              <Avatar
                src={getAvatarUrl(userInfo?.avatar || '')}
                icon={!userInfo?.avatar && <UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
              <span className="navbar-username">{userInfo?.username || '用户'}</span>
            </div>
          </Dropdown>
        ) : (
          <div className="navbar-auth-buttons">
            <Link to="/login">
              <Button type="text" className="navbar-login-btn">登录</Button>
            </Link>
            <Link to="/register">
              <Button type="primary" className="navbar-register-btn">注册</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );

  // 渲染移动端导航
  const renderMobileNav = () => (
    <>
      {/* Logo */}
      <div className="navbar-logo">
        <Link to="/">校园二手集市</Link>
      </div>

      {/* 汉堡菜单按钮 */}
      <Button
        type="text"
        icon={mobileMenuVisible ? <CloseOutlined /> : <MenuOutlined />}
        onClick={() => setMobileMenuVisible(true)}
        className="navbar-mobile-toggle"
      />

      {/* 移动端抽屉菜单 */}
      <Drawer
        title={<span className="navbar-drawer-title">校园二手集市</span>}
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        size="default"
        className="navbar-drawer"
      >
        {/* 用户信息区域 */}
        {isLoggedIn ? (
          <div className="navbar-drawer-user">
            <Avatar
              src={getAvatarUrl(userInfo?.avatar || '')}
              icon={!userInfo?.avatar && <UserOutlined />}
              size={48}
            />
            <span className="navbar-drawer-username">{userInfo?.username || '用户'}</span>
          </div>
        ) : (
          <div className="navbar-drawer-auth">
            <Link to="/login" onClick={() => setMobileMenuVisible(false)}>
              <Button type="primary" block>登录</Button>
            </Link>
            <Link to="/register" onClick={() => setMobileMenuVisible(false)}>
              <Button block style={{ marginTop: 8 }}>注册</Button>
            </Link>
          </div>
        )}

        {/* 菜单项 */}
        <Menu
          mode="vertical"
          selectedKeys={[getSelectedKey()]}
          items={[
            {
              key: '/',
              icon: <HomeOutlined />,
              label: <Link to="/" onClick={() => setMobileMenuVisible(false)}>首页</Link>,
            },
            {
              key: '/goods',
              icon: <AppstoreOutlined />,
              label: <Link to="/goods" onClick={() => setMobileMenuVisible(false)}>商品列表</Link>,
            },
            ...(isLoggedIn ? [
              {
                key: '/publish',
                icon: <PlusOutlined />,
                label: <Link to="/publish" onClick={() => setMobileMenuVisible(false)}>发布商品</Link>,
              },
              {
                key: '/profile',
                icon: <UserOutlined />,
                label: <Link to="/profile" onClick={() => setMobileMenuVisible(false)}>个人中心</Link>,
              },
              {
                key: '/collect',
                icon: <HeartOutlined />,
                label: <Link to="/collect" onClick={() => setMobileMenuVisible(false)}>我的收藏</Link>,
              },
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: '退出登录',
                danger: true,
                onClick: handleLogout,
              },
            ] : []),
          ]}
        />
      </Drawer>
    </>
  );

  return (
    <Header className="navbar">
      <div className="navbar-container">
        {/* PC端导航 - 默认显示 */}
        <div className="navbar-pc">
          {renderPCNav()}
        </div>
        {/* 移动端导航 - 屏幕小于768px时显示 */}
        <div className="navbar-mobile">
          {renderMobileNav()}
        </div>
      </div>
    </Header>
  );
};

export default NavBar;
