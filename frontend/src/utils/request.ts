import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { message, Spin } from 'antd';
import React from 'react';

// 创建 React 全局 Spin 容器
let loadingCount = 0;
let spinInstance: React.ReactNode = null;

const showLoading = (): void => {
  loadingCount++;
  if (loadingCount === 1) {
    spinInstance = message.loading('加载中...', 0);
  }
};

const hideLoading = (): void => {
  loadingCount--;
  if (loadingCount <= 0) {
    loadingCount = 0;
    if (spinInstance) {
      (spinInstance as any)();
      spinInstance = null;
    }
  }
};

// 创建 axios 实例
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 防抖函数
const debounceMap = new Map<string, number>();
const DEBOUNCE_DELAY = 300;

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 从 localStorage 获取 Token 并添加到请求头
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // 显示加载状态（排除某些不需要 loading 的请求）
        const hideLoadingUrls = ['/api/goods']; // 商品列表不需要全局loading
        const shouldShowLoading = !hideLoadingUrls.some(url => config.url?.includes(url));
        
        if (shouldShowLoading) {
          showLoading();
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse) => {
        hideLoading();
        
        const res = response.data;
        
        // 业务逻辑错误处理
        if (res.code !== 200) {
            // 不显示 toast 的成功提示
            const noToastUrls = ['/api/collect/check'];
            const shouldShowToast = !noToastUrls.some(url => response.config.url?.includes(url));
            
            if (shouldShowToast) {
                message.error(res.msg || '操作失败');
            }
            return Promise.reject(res);
        }
        
        return response;
    },
    (error: AxiosError) => {
        hideLoading();
        
        if (error.response) {
            const { status, data } = error.response;
            const res = data as any;
            
            if (status === 401) {
                message.error('登录已过期，请重新登录');
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                window.location.href = '/login';
            } else if (status === 403) {
                message.error(res?.msg || '没有权限访问');
            } else if (status === 404) {
                message.error(res?.msg || '请求的资源不存在');
            } else if (status === 500) {
                message.error('服务器内部错误，请稍后重试');
            } else if (status === 400) {
                message.error(res?.msg || '请求参数错误');
            } else {
                message.error(res?.msg || '请求失败');
            }
        } else if (error.code === 'ECONNABORTED') {
            message.error('请求超时，请稍后重试');
        } else {
            message.error('网络连接失败，请检查网络');
        }
        
        return Promise.reject(error);
    }
);

export default request;
