/**
 * 用户类型定义
 * 用于前后端数据交互的 TypeScript 类型约束
 */

// 用户信息（不含密码）
export interface UserInfo {
  id: number;           // 用户ID
  username: string;     // 用户名
  phone: string;       // 手机号
  avatar: string;       // 头像URL
  createdAt: string;   // 创建时间
}

// 注册请求参数
export interface RegisterParams {
  username: string;
  password: string;
  phone: string;
}

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应数据
export interface LoginResponse {
  token: string;        // JWT Token
  user: UserInfo;      // 用户信息
}

// 统一响应结构（后端返回格式）
export interface ApiResponse<T = unknown> {
  code: number;         // 状态码
  msg: string;         // 提示信息
  data: T;             // 响应数据
}

// 登录 API 响应类型
export type LoginApiResponse = ApiResponse<LoginResponse>;

// 注册 API 响应类型
export type RegisterApiResponse = ApiResponse<UserInfo>;

// 获取用户信息 API 响应类型
export type UserInfoApiResponse = ApiResponse<UserInfo>;
