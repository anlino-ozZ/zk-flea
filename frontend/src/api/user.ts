/**
 * 用户 API 封装
 * 与后端用户接口交互的请求函数
 */

import request from '../utils/request';
import type {
  LoginParams,
  RegisterParams,
  LoginApiResponse,
  RegisterApiResponse,
  UserInfoApiResponse,
  UserInfo,
  UpdateUserParams
} from '../types/user';

/**
 * 用户登录
 * @param params - 登录参数（用户名、密码）
 * @returns Promise 登录响应 { token, user }
 */
export async function login(params: LoginParams): Promise<LoginApiResponse> {
  const response = await request.post<LoginApiResponse>('/api/user/login', params);
  return response.data;
}

/**
 * 用户注册
 * @param params - 注册参数（用户名、密码、手机号）
 * @returns Promise 注册响应（用户信息）
 */
export async function register(params: RegisterParams): Promise<RegisterApiResponse> {
  const response = await request.post<RegisterApiResponse>('/api/user/register', params);
  return response.data;
}

/**
 * 获取当前用户信息
 * @returns Promise 用户信息
 */
export async function getUserInfo(): Promise<UserInfoApiResponse> {
  const response = await request.get<UserInfoApiResponse>('/api/user/info');
  return response.data;
}

/**
 * 更新当前用户信息
 * @param params - 更新参数（手机号、头像）
 * @returns Promise 更新后的用户信息
 */
export async function updateUserInfo(params: UpdateUserParams): Promise<UserInfoApiResponse> {
  const response = await request.put<UserInfoApiResponse>('/api/user/profile', params);
  return response.data;
}

/**
 * 上传头像
 * @param file - 头像文件
 * @returns Promise 更新后的用户信息
 */
export async function uploadAvatar(file: File): Promise<UserInfoApiResponse> {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await request.post<UserInfoApiResponse>('/api/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

/**
 * 存储 Token 到 localStorage
 * @param token - JWT Token
 */
export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * 从 localStorage 获取 Token
 * @returns Token 字符串或 null
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * 清除 localStorage 中的 Token
 */
export function removeToken(): void {
  localStorage.removeItem('token');
}

/**
 * 存储用户信息到 localStorage
 * @param user - 用户信息对象
 */
export function setUserInfo(user: UserInfo): void {
  localStorage.setItem('userInfo', JSON.stringify(user));
}

/**
 * 从 localStorage 获取用户信息
 * @returns 用户信息对象或 null
 */
export function getUserInfoFromStorage(): UserInfo | null {
  const userInfoStr = localStorage.getItem('userInfo');
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * 清除 localStorage 中的用户信息
 */
export function removeUserInfo(): void {
  localStorage.removeItem('userInfo');
}

export default {
  login,
  register,
  getUserInfo,
  setToken,
  getToken,
  removeToken,
  setUserInfo,
  getUserInfoFromStorage,
  removeUserInfo
};
