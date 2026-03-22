/**
 * 商品类型定义
 * 用于前后端数据交互的 TypeScript 类型约束
 */

// 商品状态（数字枚举，与后端保持一致）
export enum GoodsStatus {
  ON_SALE = 0,     // 在售
  TRADING = 1,     // 交易中
  SOLD = 2,        // 已售出
  OFF_SHELF = 3    // 已下架
}

// 商品新旧程度
export enum GoodsCondition {
  BRAND_NEW = 1,   // 全新
  LIKE_NEW = 2,    // 几乎全新
  LIKE_NEW_3 = 3,  // 九成新
  LIKE_NEW_4 = 4,  // 八成新
  LIKE_NEW_5 = 5   // 七成新及以下
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
  status: GoodsStatus;  // 商品状态 (0-在售,1-交易中,2-已售出,3-已下架)
  condition: GoodsCondition; // 新旧程度 (1-5)
  pickupLocation: string; // 自提地点
  isBook: boolean;      // 是否为图书
  viewCount: number;    // 浏览次数
  favoriteCount: number; // 收藏次数
  createdAt: string;    // 创建时间（ISO字符串）
  updatedAt: string;   // 更新时间（ISO字符串）
  isCollected?: boolean; // 当前用户是否已收藏
  // 图书特有信息（当isBook为true时）
  bookInfo?: {
    isbn: string;
    author: string;
    publisher: string;
    publishYear: number;
    edition: string;
    language: string;
    pages: number;
  };
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
  isBook?: boolean;     // 是否为图书筛选（可选）
  condition?: GoodsCondition; // 新旧程度筛选（可选）
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
