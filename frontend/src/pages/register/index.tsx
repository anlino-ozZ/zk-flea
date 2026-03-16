/**
 * 注册页面
 * 用户注册表单，包含用户名/密码/手机号输入和表单校验
 */

import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/user';
import type { RegisterParams } from '../../types/user';
import './index.css';

const { Title } = Typography;

/**
 * 注册页面主组件
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 处理注册提交
   * @param values - 表单数据
   */
  const handleSubmit = async (values: RegisterParams): Promise<void> => {
    setLoading(true);
    try {
      const response = await register(values);

      if (response.code === 200 || response.code === 201) {
        message.success('注册成功，请登录');
        navigate('/login');
      } else {
        message.error(response.msg || '注册失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 自定义密码校验
   */
  const validatePassword = (_: unknown, value: string): Promise<void> => {
    if (!value) {
      return Promise.reject('请输入密码');
    }
    if (value.length < 6) {
      return Promise.reject('密码长度不能少于6个字符');
    }
    if (value.length > 20) {
      return Promise.reject('密码长度不能超过20个字符');
    }
    return Promise.resolve();
  };

  /**
   * 自定义确认密码校验
   */
  const validateConfirmPassword = (_: unknown, value: string, form: any): Promise<void> => {
    const password = form?.getFieldValue?.('password');
    if (!value) {
      return Promise.reject('请再次输入密码');
    }
    if (password && value !== password) {
      return Promise.reject('两次输入的密码不一致');
    }
    return Promise.resolve();
  };

  return (
    <div className="register-page">
      <Card className="register-card">
        <div className="register-header">
          <Title level={3} className="register-title">校享二手 - 注册</Title>
        </div>

        <Form
          name="register"
          initialValues={{ remember: true }}
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          {/* 用户名输入框 */}
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>

          {/* 手机号输入框 */}
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input
              prefix={<MobileOutlined />}
              placeholder="手机号"
              maxLength={11}
            />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item
            name="password"
            rules={[{ validator: validatePassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码（6-20个字符）"
            />
          </Form.Item>

          {/* 确认密码输入框 */}
          <Form.Item
            name="confirmPassword"
            rules={[{ validator: validateConfirmPassword }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
            />
          </Form.Item>

          {/* 注册按钮 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              注册
            </Button>
          </Form.Item>

          {/* 登录链接 */}
          <div className="register-footer">
            已有账号？<a onClick={() => navigate('/login')}>立即登录</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
