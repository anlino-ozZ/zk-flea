/**
 * 用户数据模型
 * 定义用户的数据结构和类型
 */

// 用户实体接口
export interface User {
  id: number;           // 用户ID
  username: string;     // 用户名（唯一）
  password: string;     // 加密后的密码
  phone: string;       // 手机号（唯一）
  avatar: string;       // 头像URL
  createdAt: string;   // 创建时间
  updatedAt: string;   // 更新时间
}

// 注册请求参数
export interface RegisterParams {
  username: string;
  password: string;
  phone: string;
}

// 更新用户信息参数
export interface UpdateUserParams {
  phone?: string;
  avatar?: string;
}

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 用户信息（不含密码）
export interface UserInfo {
  id: number;
  username: string;
  phone: string;
  avatar: string;
  createdAt: string;
}

// JWT Payload
export interface JwtPayload {
  userId: number;
  username: string;
}

// 模拟用户数据（实际项目中应从数据库获取）
// 密码均为加密后的: 123456 -> $2b$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH
const mockUsers: User[] = [
  {
    id: 1,
    username: 'testuser',
    password: '$2b$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iR4aF.', // 123456
    phone: '13800138000',
    avatar: 'https://picsum.photos/100/100?random=20',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

/**
 * 根据用户名查找用户
 * @param username 用户名
 * @returns 用户信息或null
 */
export function findUserByUsername(username: string): User | null {
  return mockUsers.find(user => user.username === username) || null;
}

/**
 * 根据手机号查找用户
 * @param phone 手机号
 * @returns 用户信息或null
 */
export function findUserByPhone(phone: string): User | null {
  return mockUsers.find(user => user.phone === phone) || null;
}

/**
 * 根据ID查找用户
 * @param id 用户ID
 * @returns 用户信息或null
 */
export function findUserById(id: number): User | null {
  return mockUsers.find(user => user.id === id) || null;
}

/**
 * 创建新用户
 * @param userData 用户数据
 * @returns 创建后的用户信息
 */
export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const now = new Date().toISOString();
  const newUser: User = {
    ...userData,
    id: mockUsers.length + 1,
    createdAt: now,
    updatedAt: now
  };
  mockUsers.push(newUser);
  return newUser;
}

/**
 * 获取用户列表（用于测试）
 */
export function getMockUsers(): User[] {
  return mockUsers;
}

/**
 * 更新用户信息
 * @param id 用户ID
 * @param updates 要更新的字段
 * @returns 更新后的用户或null
 */
export function updateUser(id: number, updates: UpdateUserParams): User | null {
  const userIndex = mockUsers.findIndex(user => user.id === id);
  if (userIndex === -1) {
    return null;
  }
  
  const user = mockUsers[userIndex];
  const updatedUser: User = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  mockUsers[userIndex] = updatedUser;
  return updatedUser;
}

export default {
  findUserByUsername,
  findUserByPhone,
  findUserById,
  createUser,
  getMockUsers,
  updateUser
};
