/**
 * 商品类型定义
 * 用于前后端数据交互的 TypeScript 类型约束
 */

// 商品状态枚举
export enum GoodsStatus {
  DRAFT = 'draft',       // 草稿
  PENDING = 'pending',  // 待审核
  ON_SALE = 'on_sale',  // 在售
  SOLD = 'sold',        // 已售出
  OFF_SHELF = 'off_shelf' // 已下架
}

// 商品实体类型
export interface Goods {
  id: number;           // 商品ID
  title: string;        // 商品标题
  description: string;  // 商品描述
  price: number;        // 商品价格（分）
  originalPrice: number; // 原价（分）
  images: string[];     // 商品图片URL数组
  categoryId: number;   // 分类ID
  categoryName: string; // 分类名称
  sellerId: number;     // 卖家ID
  sellerName: string;   // 卖家昵称
  sellerAvatar: string; // 卖家头像
  status: GoodsStatus;  // 商品状态
  viewCount: number;    // 浏览次数
  favoriteCount: number; // 收藏次数
  createdAt: string;    // 创建时间（ISO字符串）
  updatedAt: string;   // 更新时间（ISO字符串）
  isCollected?: boolean; // 当前用户是否已收藏
}

// 分页请求参数
export interface GoodsListParams {
  page: number;         // 当前页码（从1开始）
  pageSize: number;     // 每页数量
  keyword?: string;     // 搜索关键词（可选）
  categoryId?: number;  // 分类ID筛选（可选）
  status?: GoodsStatus; // 商品状态筛选（可选）
  minPrice?: number;    // 最低价格筛选（可选）
  maxPrice?: number;    // 最高价格筛选（可选）
  sortBy?: 'createdAt' | 'price' | 'viewCount'; // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序方向
}

// 分页响应结果
export interface GoodsListResponse {
  list: Goods[];        // 商品列表
  total: number;        // 总记录数
  page: number;         // 当前页码
  pageSize: number;     // 每页数量
  totalPages: number;   // 总页数
}

// 统一响应结构（后端返回格式）
export interface ApiResponse<T = unknown> {
  code: number;         // 状态码（200成功，400参数错误，401未授权，404不存在，500服务器错误）
  msg: string;         // 提示信息
  data: T;             // 响应数据
}

// 商品列表 API 响应类型
export type GoodsListApiResponse = ApiResponse<GoodsListResponse>;
