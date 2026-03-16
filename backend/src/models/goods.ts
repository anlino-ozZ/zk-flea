/**
 * 商品数据模型
 * 定义商品的数据结构和类型
 */

// 商品状态枚举（与前端保持一致）
export enum GoodsStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ON_SALE = 'on_sale',
  SOLD = 'sold',
  OFF_SHELF = 'off_shelf'
}

// 商品实体接口
export interface Goods {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  categoryId: number;
  categoryName: string;
  sellerId: number;
  sellerName: string;
  sellerAvatar: string;
  status: GoodsStatus;
  viewCount: number;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

// 分页查询参数接口
export interface GoodsQueryParams {
  page: number;
  pageSize: number;
  keyword?: string;
  categoryId?: number;
  status?: GoodsStatus;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'createdAt' | 'price' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}

// 分页响应结果接口
export interface GoodsListResult {
  list: Goods[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 模拟商品数据（实际项目中应从数据库获取）
const mockGoodsList: Goods[] = [
  {
    id: 1,
    title: 'iPhone 14 Pro Max 256G 银色',
    description: '99新，无任何划痕，配件齐全，盒说全',
    price: 699900,
    originalPrice: 899900,
    images: ['https://picsum.photos/400/400?random=1'],
    categoryId: 1,
    categoryName: '手机数码',
    sellerId: 1001,
    sellerName: '数码达人',
    sellerAvatar: 'https://picsum.photos/100/100?random=10',
    status: GoodsStatus.ON_SALE,
    viewCount: 1523,
    favoriteCount: 89,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: 'MacBook Pro 14寸 M2芯片',
    description: '2023款，8+16G配置，电池健康度98%',
    price: 1099900,
    originalPrice: 1499900,
    images: ['https://picsum.photos/400/400?random=2'],
    categoryId: 1,
    categoryName: '手机数码',
    sellerId: 1002,
    sellerName: '果粉之家',
    sellerAvatar: 'https://picsum.photos/100/100?random=11',
    status: GoodsStatus.ON_SALE,
    viewCount: 2341,
    favoriteCount: 156,
    createdAt: '2024-01-14T15:20:00Z',
    updatedAt: '2024-01-14T15:20:00Z'
  },
  {
    id: 3,
    title: 'aj1芝加哥配色',
    description: '全新未穿，42码，支持鉴定',
    price: 159900,
    originalPrice: 189900,
    images: ['https://picsum.photos/400/400?random=3'],
    categoryId: 2,
    categoryName: '潮流服饰',
    sellerId: 1003,
    sellerName: '球鞋小王子',
    sellerAvatar: 'https://picsum.photos/100/100?random=12',
    status: GoodsStatus.ON_SALE,
    viewCount: 892,
    favoriteCount: 45,
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z'
  },
  {
    id: 4,
    title: 'switch OLED 主机',
    description: '日版续航版，箱说全，送保护壳',
    price: 189900,
    originalPrice: 229900,
    images: ['https://picsum.photos/400/400?random=4'],
    categoryId: 3,
    categoryName: '游戏动漫',
    sellerId: 1004,
    sellerName: '游戏肥宅',
    sellerAvatar: 'https://picsum.photos/100/100?random=13',
    status: GoodsStatus.ON_SALE,
    viewCount: 1205,
    favoriteCount: 67,
    createdAt: '2024-01-12T18:45:00Z',
    updatedAt: '2024-01-12T18:45:00Z'
  },
  {
    id: 5,
    title: '小米电视 55寸 4K',
    description: '使用了半年，画质完好，配件遥控器齐全',
    price: 159900,
    originalPrice: 299900,
    images: ['https://picsum.photos/400/400?random=5'],
    categoryId: 4,
    categoryName: '家用电器',
    sellerId: 1005,
    sellerName: '家电回收',
    sellerAvatar: 'https://picsum.photos/100/100?random=14',
    status: GoodsStatus.ON_SALE,
    viewCount: 567,
    favoriteCount: 23,
    createdAt: '2024-01-11T12:00:00Z',
    updatedAt: '2024-01-11T12:00:00Z'
  },
  {
    id: 6,
    title: '考研书籍套装',
    description: '政治英语数学全套，几乎全新',
    price: 19900,
    originalPrice: 49900,
    images: ['https://picsum.photos/400/400?random=6'],
    categoryId: 5,
    categoryName: '图书文具',
    sellerId: 1006,
    sellerName: '考研上岸',
    sellerAvatar: 'https://picsum.photos/100/100?random=15',
    status: GoodsStatus.ON_SALE,
    viewCount: 321,
    favoriteCount: 12,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: 7,
    title: '电动滑板车',
    description: '九号电动滑板车，续航30km，功能正常',
    price: 129900,
    originalPrice: 199900,
    images: ['https://picsum.photos/400/400?random=7'],
    categoryId: 6,
    categoryName: '运动出行',
    sellerId: 1007,
    sellerName: '出行达人',
    sellerAvatar: 'https://picsum.photos/100/100?random=16',
    status: GoodsStatus.ON_SALE,
    viewCount: 789,
    favoriteCount: 34,
    createdAt: '2024-01-09T16:20:00Z',
    updatedAt: '2024-01-09T16:20:00Z'
  },
  {
    id: 8,
    title: '猫爬架大型',
    description: '自制猫爬架，1.5米高，九成新',
    price: 29900,
    originalPrice: 59900,
    images: ['https://picsum.photos/400/400?random=8'],
    categoryId: 7,
    categoryName: '宠物用品',
    sellerId: 1008,
    sellerName: '猫奴一枚',
    sellerAvatar: 'https://picsum.photos/100/100?random=17',
    status: GoodsStatus.ON_SALE,
    viewCount: 456,
    favoriteCount: 28,
    createdAt: '2024-01-08T11:10:00Z',
    updatedAt: '2024-01-08T11:10:00Z'
  }
];

/**
 * 获取商品列表（带分页和筛选）
 * @param params 查询参数
 * @returns 分页结果
 */
export function getGoodsList(params: GoodsQueryParams): GoodsListResult {
  const {
    page = 1,
    pageSize = 10,
    keyword,
    categoryId,
    status = GoodsStatus.ON_SALE,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params;

  // 筛选数据
  let filteredList = [...mockGoodsList];

  // 按关键词筛选
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    filteredList = filteredList.filter(
      goods =>
        goods.title.toLowerCase().includes(lowerKeyword) ||
        goods.description.toLowerCase().includes(lowerKeyword)
    );
  }

  // 按分类筛选
  if (categoryId) {
    filteredList = filteredList.filter(goods => goods.categoryId === categoryId);
  }

  // 按状态筛选
  if (status) {
    filteredList = filteredList.filter(goods => goods.status === status);
  }

  // 按价格区间筛选
  if (minPrice !== undefined) {
    filteredList = filteredList.filter(goods => goods.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    filteredList = filteredList.filter(goods => goods.price <= maxPrice);
  }

  // 排序
  filteredList.sort((a, b) => {
    let compareResult = 0;
    switch (sortBy) {
      case 'price':
        compareResult = a.price - b.price;
        break;
      case 'viewCount':
        compareResult = a.viewCount - b.viewCount;
        break;
      case 'createdAt':
      default:
        compareResult = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortOrder === 'desc' ? -compareResult : compareResult;
  });

  // 计算分页
  const total = filteredList.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const list = filteredList.slice(startIndex, endIndex);

  return {
    list,
    total,
    page,
    pageSize,
    totalPages
  };
}

/**
 * 根据ID获取商品详情
 * @param id 商品ID
 * @returns 商品详情或null
 */
export function getGoodsById(id: number): Goods | null {
  return mockGoodsList.find(goods => goods.id === id) || null;
}

export default {
  getGoodsList,
  getGoodsById
};
