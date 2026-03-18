/**
 * 参数校验工具
 * 使用 joi 库进行请求参数校验
 */

import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

/**
 * 校验中间件工厂函数
 * @param schema - Joi 校验 schema
 * @param property - 要校验的属性 (body, query, params)
 */
export function validate(schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[property];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // 返回所有错误，而不是只返回第一个
      stripUnknown: true // 移除未知字段
    });

    if (error) {
      const errorMessage = error.details
        .map(detail => detail.message.replace(/"/g, ''))
        .join(', ');
      
      res.status(400).json({
        code: 400,
        msg: errorMessage,
        data: null
      });
      return;
    }

    // 注意：不直接修改 req，只做校验
    next();
  };
}

// 常用校验规则
export const schemas = {
  // 用户注册
  register: Joi.object({
    username: Joi.string().min(3).max(20).required()
      .messages({ 'string.empty': '用户名不能为空' }),
    password: Joi.string().min(6).max(20).required()
      .messages({ 'string.empty': '密码不能为空' }),
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required()
      .messages({ 'string.pattern.base': '请输入有效的手机号' })
  }),

  // 用户登录
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),

  // 更新用户信息
  updateProfile: Joi.object({
    phone: Joi.string().pattern(/^1[3-9]\d{9}$/)
      .messages({ 'string.pattern.base': '请输入有效的手机号' }),
    avatar: Joi.string()
  }),

  // 商品列表查询
  goodsList: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10),
    keyword: Joi.string().allow(''),
    categoryId: Joi.number().integer().positive(),
    status: Joi.string(),
    minPrice: Joi.number().positive(),
    maxPrice: Joi.number().positive(),
    sortBy: Joi.string().valid('createdAt', 'price', 'viewCount'),
    sortOrder: Joi.string().valid('asc', 'desc')
  }),

  // 发布商品
  publishGoods: Joi.object({
    title: Joi.string().min(1).max(100).required()
      .messages({ 'string.empty': '商品标题不能为空' }),
    description: Joi.string().min(1).max(2000).required(),
    price: Joi.number().positive().required(),
    originalPrice: Joi.number().positive().required(),
    images: Joi.array().items(Joi.string()).min(1).required()
      .messages({ 'array.min': '请至少上传一张商品图片' }),
    categoryId: Joi.number().integer().positive().required(),
    categoryName: Joi.string().required()
  }),

  // 更新商品
  updateGoods: Joi.object({
    title: Joi.string().min(1).max(100),
    description: Joi.string().min(1).max(2000),
    price: Joi.number().positive(),
    originalPrice: Joi.number().positive(),
    images: Joi.array().items(Joi.string()).min(1),
    categoryId: Joi.number().integer().positive(),
    categoryName: Joi.string(),
    status: Joi.string()
  }),

  // 留言参数（POST 添加/回复）
  message: Joi.object({
    goodsId: Joi.number().integer().positive().required(),
    content: Joi.string().min(1).max(500).required(),
    parentId: Joi.number().integer().positive(),
    replyToUserId: Joi.number().integer().positive()
  }),

  // 留言列表查询（GET）
  messageList: Joi.object({
    goodsId: Joi.number().integer().positive().required(),
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
  }),

  // ID 参数
  idParam: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // goodsId 参数（URL 路径参数）
  goodsIdParam: Joi.object({
    goodsId: Joi.number().integer().positive().required()
  }),

  // 收藏操作
  collect: Joi.object({
    goodsId: Joi.number().integer().positive().required()
  }),

  // 收藏列表查询
  collectList: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
  })
};

export default { validate, schemas };
