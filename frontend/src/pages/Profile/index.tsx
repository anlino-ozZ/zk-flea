/**
 * 个人中心页面
 * 展示用户信息，支持修改资料和退出登录
 */

import React, { useState } from 'react';
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
  Divider,
  List
} from 'antd';
import { 
  UserOutlined, 
  PhoneOutlined, 
  CalendarOutlined, 
  EditOutlined, 
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserInfoFromStorage, updateUserInfo as updateUserInfoApi, setUserInfo, removeToken, removeUserInfo } from '../../api/user';
import type { UserInfo } from '../../types/user';

const { Title, Text } = Typography;

interface ProfileFormValues {
  phone: string;
  avatar: string;
}

const ProfilePage: React.FC = () => {
  console.log('ProfilePage 渲染了');
  const navigate = useNavigate();
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(getUserInfoFromStorage());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<ProfileFormValues>();

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
        // 更新本地存储的用户信息
        setUserInfo(response.data);
        // 刷新用户信息
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

  // 返回首页
  const handleGoHome = (): void => {
    navigate('/');
  };

  // 如果未登录，跳转到登录页
  if (!userInfo) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Text>请先登录</Text>
        <br />
        <Button type="link" onClick={() => navigate('/login')}>去登录</Button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '16px', 
      maxWidth: '600px', 
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      {/* 用户信息卡片 */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Avatar 
            size={100} 
            src={userInfo.avatar} 
            icon={<UserOutlined />}
            style={{ marginBottom: '16px' }}
          />
          <Title level={3} style={{ marginBottom: '8px' }}>
            {userInfo.username}
          </Title>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={handleEditClick}
          >
            修改资料
          </Button>
        </div>

        <Divider style={{ margin: '24px 0' }} />

        <List>
          <List.Item>
            <Space>
              <PhoneOutlined />
              <Text type="secondary">手机号</Text>
            </Space>
            <Text>{userInfo.phone}</Text>
          </List.Item>
          <List.Item>
            <Space>
              <CalendarOutlined />
              <Text type="secondary">注册时间</Text>
            </Space>
            <Text>{formatDate(userInfo.createdAt)}</Text>
          </List.Item>
        </List>
      </Card>

      {/* 操作按钮 */}
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            block 
            icon={<SettingOutlined />} 
            onClick={handleEditClick}
          >
            修改个人资料
          </Button>
          <Button 
            block 
            icon={<LogoutOutlined />} 
            danger 
            onClick={handleLogout}
          >
            退出登录
          </Button>
          <Button 
            block 
            onClick={handleGoHome}
          >
            返回首页
          </Button>
        </Space>
      </Card>

      {/* 修改资料弹窗 */}
      <Modal
        title="修改个人资料"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={400}
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
