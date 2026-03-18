/**
 * 路由配置
 * 包含所有页面路由和登录鉴权
 */

import { Navigate, useLocation } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { getToken } from '../api/user';

// 页面组件
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/register';
import GoodsListPage from '../pages/goods';
import DetailPage from '../pages/Detail';
import PublishPage from '../pages/Publish';
import ProfilePage from '../pages/Profile';
import CollectPage from '../pages/Collect';
import NotFoundPage from '../pages/NotFound';

// 登录页面对应的路径
const loginPath = '/login';

// 路由路径常量
export const Routes = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  GOODS: '/goods',
  GOODS_DETAIL: '/goods/:id',
  PUBLISH: '/publish',
  PROFILE: '/profile',
  COLLECT: '/collect',
  NOT_FOUND: '/404',
} as const;

/**
 * 路由守卫组件
 * 检查用户是否已登录，未登录则跳转到登录页
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    // 未登录，重定向到登录页，并记录当前路径
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

/**
 * 公共路由组件
 * 不需要登录即可访问的页面
 */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const token = getToken();

  // 如果已登录且访问登录/注册页，重定向到首页
  if (token && (location.pathname === loginPath || location.pathname === '/register')) {
    return <Navigate to={Routes.HOME} replace />;
  }

  return <>{children}</>;
};

// 路由配置
const routes: RouteObject[] = [
  // 首页 - 公开
  {
    path: Routes.HOME,
    element: <HomePage />,
  },
  // 登录页 - 公共（已登录重定向到首页）
  {
    path: Routes.LOGIN,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  // 注册页 - 公共（已登录重定向到首页）
  // 使用LoginPage组件，通过activeKey控制默认显示注册标签
  {
    path: Routes.REGISTER,
    element: (
      <PublicRoute>
        <LoginPage registerDefault />
      </PublicRoute>
    ),
  },
  // 商品列表 - 公开
  {
    path: Routes.GOODS,
    element: <GoodsListPage />,
  },
  // 商品详情 - 公开
  {
    path: Routes.GOODS_DETAIL,
    element: <DetailPage />,
  },
  // 发布商品 - 需要登录
  {
    path: Routes.PUBLISH,
    element: (
      <ProtectedRoute>
        <PublishPage />
      </ProtectedRoute>
    ),
  },
  // 个人中心 - 需要登录
  {
    path: Routes.PROFILE,
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  // 我的收藏 - 需要登录
  {
    path: Routes.COLLECT,
    element: (
      <ProtectedRoute>
        <CollectPage />
      </ProtectedRoute>
    ),
  },
  // 404 页面
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
