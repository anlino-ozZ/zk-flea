/**
 * 鉴权 Hook
 * 提供用户登录状态管理和 Token 验证功能
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, removeToken, getUserInfoFromStorage, removeUserInfo, getUserInfo } from '../api/user';
import type { UserInfo } from '../types/user';

/**
 * 鉴权 Hook 返回值类型
 */
interface UseAuthReturn {
  isAuthenticated: boolean;    // 是否已登录
  userInfo: UserInfo | null;   // 用户信息
  isLoading: boolean;          // 是否正在验证
  login: () => void;           // 跳转到登录页
  logout: () => void;          // 退出登录
  checkAuth: () => Promise<void>; // 验证 Token 有效性
  refreshUserInfo: () => Promise<void>; // 刷新用户信息
}

/**
 * 鉴权 Hook
 * 用于管理用户登录状态
 */
export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * 验证 Token 有效性
   * 如果 Token 有效则获取用户信息，否则清除登录状态
   */
  const checkAuth = useCallback(async (): Promise<void> => {
    const token = getToken();

    if (!token) {
      // 无 Token，设置未登录状态
      setIsAuthenticated(false);
      setUserInfo(null);
      setIsLoading(false);
      return;
    }

    try {
      // 尝试从 localStorage 获取用户信息（用于快速显示）
      const storedUserInfo = getUserInfoFromStorage();
      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
        setIsAuthenticated(true);
      }

      // 验证 Token 有效性（调用后端接口）
      const response = await getUserInfo();

      if (response.code === 200) {
        // Token 有效，更新用户信息
        setUserInfo(response.data);
        setIsAuthenticated(true);
      } else {
        // Token 无效，清除登录状态
        handleLogout();
      }
    } catch (error) {
      console.error('验证 Token 失败:', error);
      // 网络错误时，保留本地存储的登录状态
      if (!userInfo) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [userInfo]);

  /**
   * 处理退出登录
   * 清除 Token 和用户信息，并跳转到登录页
   */
  const handleLogout = useCallback((): void => {
    // 清除 localStorage 中的 Token 和用户信息
    removeToken();
    removeUserInfo();

    // 更新状态
    setIsAuthenticated(false);
    setUserInfo(null);

    // 跳转到登录页
    navigate('/login');
  }, [navigate]);

  /**
   * 跳转到登录页
   */
  const login = useCallback((): void => {
    navigate('/login');
  }, [navigate]);

  /**
   * 刷新用户信息
   * 从后端获取最新用户信息
   */
  const refreshUserInfo = useCallback(async (): Promise<void> => {
    try {
      const response = await getUserInfo();
      if (response.code === 200) {
        setUserInfo(response.data);
        // 同时更新 localStorage
        localStorage.setItem('userInfo', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  }, []);

  // 组件挂载时验证 Token
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    userInfo,
    isLoading,
    login,
    logout: handleLogout,
    checkAuth,
    refreshUserInfo
  };
}

export default useAuth;
