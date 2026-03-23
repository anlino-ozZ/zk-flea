/**
 * 图书 API 路由
 */

import { Router } from 'express';
import { getBookByISBN, searchBooks } from '../services/bookService';

const router = Router();

/**
 * GET /api/books/:isbn
 * 根据 ISBN 查询图书信息
 */
router.get('/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    
    if (!isbn) {
      return res.status(400).json({
        code: 400,
        msg: 'ISBN不能为空',
        data: null
      });
    }

    // 清理 ISBN（去除横杠）
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    const bookInfo = await getBookByISBN(cleanIsbn);
    
    if (bookInfo) {
      return res.json({
        code: 200,
        msg: '获取成功',
        data: bookInfo
      });
    } else {
      return res.json({
        code: 404,
        msg: '未找到该图书信息，请手动输入',
        data: null
      });
    }
  } catch (error) {
    console.error('查询图书失败:', error);
    return res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: null
    });
  }
});

/**
 * GET /api/books/search
 * 搜索图书
 */
router.get('/search', async (req, res) => {
  try {
    const { keyword, limit } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        code: 400,
        msg: '关键词不能为空',
        data: []
      });
    }

    const books = await searchBooks(keyword as string, limit ? parseInt(limit as string) : 10);
    
    return res.json({
      code: 200,
      msg: '搜索成功',
      data: books
    });
  } catch (error) {
    console.error('搜索图书失败:', error);
    return res.status(500).json({
      code: 500,
      msg: '服务器错误',
      data: []
    });
  }
});

export default router;
