import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { message } from 'antd';

// 创建 axios 实例
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 从 localStorage 获取 Token 并添加到请求头
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
        console.log('响应拦截器:', response.status, response.config.url);
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                message.error('登录已过期，请重新登录');
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                window.location.href = '/login';
            } else if (status === 403) {
                message.error('没有权限访问');
            } else if (status === 404) {
                message.error('请求的资源不存在');
            } else if (status === 500) {
                message.error('服务器错误');
            }
        } else {
            message.error('网络错误');
        }
        return Promise.reject(error);
    }
);

export default request;
