/**
 * 收藏数据模型
 * 定义用户商品收藏的数据结构和类型
 */

// 收藏实体接口
export interface Collect {
  id: number;           // 收藏ID
  userId: number;       // 用户ID
  goodsId: number;      // 商品ID
  createdAt: string;    // 收藏时间
}

// 收藏参数接口
export interface CollectParams {
  goodsId: number;
}

// 模拟收藏数据（实际项目中应从数据库获取）
// 使用 Map 存储，key 为 "userId-goodsId" 组合，模拟联合唯一索引
const mockCollects: Map<string, Collect> = new Map();

/**
 * 生成收藏的唯一 key
 */
function getCollectKey(userId: number, goodsId: number): string {
  return `${userId}-${goodsId}`;
}

/**
 * 添加收藏
 * @param userId 用户ID
 * @param goodsId 商品ID
 * @returns 收藏记录或null（如果已存在）
 */
export function addCollect(userId: number, goodsId: number): Collect | null {
  const key = getCollectKey(userId, goodsId);
  
  // 检查是否已收藏
  if (mockCollects.has(key)) {
    return null;
  }
  
  const collect: Collect = {
    id: mockCollects.size + 1,
    userId,
    goodsId,
    createdAt: new Date().toISOString()
  };
  
  mockCollects.set(key, collect);
  return collect;
}

/**
 * 取消收藏
 * @param userId 用户ID
 * @param goodsId 商品ID
 * @returns 是否成功取消
 */
export function removeCollect(userId: number, goodsId: number): boolean {
  const key = getCollectKey(userId, goodsId);
  return mockCollects.delete(key);
}

/**
 * 检查是否已收藏
 * @param userId 用户ID
 * @param goodsId 商品ID
 * @returns 是否已收藏
 */
export function isCollected(userId: number, goodsId: number): boolean {
  const key = getCollectKey(userId, goodsId);
  return mockCollects.has(key);
}

/**
 * 获取用户的收藏列表
 * @param userId 用户ID
 * @returns 收藏列表
 */
export function getUserCollects(userId: number): Collect[] {
  const collects: Collect[] = [];
  mockCollects.forEach((collect) => {
    if (collect.userId === userId) {
      collects.push(collect);
    }
  });
  return collects;
}

/**
 * 获取用户收藏的商品ID列表
 * @param userId 用户ID
 * @returns 商品ID数组
 */
export function getUserCollectGoodsIds(userId: number): number[] {
  const ids: number[] = [];
  mockCollects.forEach((collect) => {
    if (collect.userId === userId) {
      ids.push(collect.goodsId);
    }
  });
  return ids;
}

export default {
  addCollect,
  removeCollect,
  isCollected,
  getUserCollects,
  getUserCollectGoodsIds
};
