/**
 * 登录页面
 */

import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, setToken, setUserInfo } from '../../api/user';
import './index.css';

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginFormValues): Promise<void> => {
    setLoading(true);
    try {
      const res = await loginApi({ username: values.username, password: values.password });
      console.log('登录结果:', res);
      
      if (res.code === 200) {
        // 保存token和用户信息
        setToken(res.data.token);
        setUserInfo(res.data.user);
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(res.msg || '登录失败');
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      message.error(error.response?.data?.msg || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Card className="login-card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>校享二手 - 登录</h2>

        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          还没有账号？<a onClick={() => navigate('/register')}>立即注册</a>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
