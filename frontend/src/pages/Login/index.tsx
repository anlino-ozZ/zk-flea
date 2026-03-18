/**
 * 登录/注册页面
 * 使用Tabs切换登录和注册表单
 */

import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, setToken, setUserInfo, register as registerApi } from '../../api/user';
import './index.css';

interface LoginFormValues {
  username: string;
  password: string;
  remember?: boolean;
}

interface RegisterFormValues {
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface LoginPageProps {
  registerDefault?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ registerDefault }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(registerDefault ? 'register' : 'login');
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  const handleLoginSubmit = async (values: LoginFormValues): Promise<void> => {
    setLoading(true);
    try {
      const res = await loginApi({ username: values.username, password: values.password });
      if (res.code === 200) {
        setToken(res.data.token);
        setUserInfo(res.data.user);
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(res.msg || '登录失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.msg || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (values: RegisterFormValues): Promise<void> => {
    setLoading(true);
    try {
      const response = await registerApi({
        username: values.username,
        phone: values.phone,
        password: values.password
      });
      if (response.code === 200 || response.code === 201) {
        message.success('注册成功，请登录');
        setActiveKey('login');
        registerForm.resetFields();
      } else {
        message.error(response.msg || '注册失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_: unknown, value: string): Promise<void> => {
    if (!value) return Promise.reject('请输入密码');
    if (value.length < 6) return Promise.reject('密码长度不能少于6个字符');
    if (value.length > 20) return Promise.reject('密码长度不能超过20个字符');
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: unknown, value: string): Promise<void> => {
    const password = registerForm.getFieldValue('password');
    if (!value) return Promise.reject('请再次输入密码');
    if (password && value !== password) return Promise.reject('两次输入的密码不一致');
    return Promise.resolve();
  };

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">校享二手</h2>
        </div>
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          className="auth-tabs"
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form form={loginForm} onFinish={handleLoginSubmit} layout="vertical" className="login-form">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                  </Form.Item>
                  <Form.Item className="form-options">
                    <div className="options-row">
                      <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>记住密码</Checkbox>
                      </Form.Item>
                      <a className="forgot-link">忘记密码？</a>
                    </div>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" loading={loading} className="submit-btn">登录</Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form form={registerForm} onFinish={handleRegisterSubmit} layout="vertical" className="login-form">
                  <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }, { min: 3, max: 20, message: '用户名长度为3-20个字符' }]}>
                    <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
                  </Form.Item>
                  <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }]}>
                    <Input prefix={<MobileOutlined />} placeholder="手机号" size="large" maxLength={11} />
                  </Form.Item>
                  <Form.Item name="password" rules={[{ validator: validatePassword }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="密码（6-20个字符）" size="large" />
                  </Form.Item>
                  <Form.Item name="confirmPassword" rules={[{ validator: validateConfirmPassword }]}>
                    <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block size="large" loading={loading} className="submit-btn">注册</Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default LoginPage;
