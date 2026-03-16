/**
 * 首页/主页
 */

import React from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserInfoFromStorage, removeToken, removeUserInfo } from '../../api/user';

const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const userInfo = getUserInfoFromStorage();

  const handleLogout = (): void => {
    removeToken();
    removeUserInfo();
    navigate('/login');
  };

  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>欢迎回来！</Title>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserOutlined style={{ fontSize: '24px' }} />
            <Text strong>当前用户：{userInfo?.username || '未登录'}</Text>
          </div>
          
          {userInfo?.phone && (
            <Text>手机号：{userInfo.phone}</Text>
          )}

          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />} 
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default HomePage;
