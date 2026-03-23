/**
 * 图书 API 封装
 * 优先使用国内可访问的 API
 */

import axios from 'axios';

// 图书信息类型
export interface BookInfo {
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  coverUrl: string;
  pages: number;
  isbn: string;
}

// 测试用假数据
const MOCK_BOOKS: Record<string, BookInfo> = {
  '9787100110532': {
    title: '图书馆学概论',
    author: '吴慰慈',
    publisher: '国家图书馆出版社',
    publishYear: 2019,
    coverUrl: '',
    pages: 280,
    isbn: '9787100110532'
  }
};

/**
 * 通过 OpenLibrary 搜索
 */
async function queryOpenLibrary(isbn: string): Promise<BookInfo | null> {
  try {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    console.log('开始查询 OpenLibrary, ISBN:', cleanIsbn);
    
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: { q: cleanIsbn, limit: 5 },
      timeout: 8000
    });

    console.log('OpenLibrary 响应:', response.data);

    if (response.data.docs && response.data.docs.length > 0) {
      const doc = response.data.docs[0];
      const isbn13 = doc.isbn_13?.[0] || doc.isbn?.[0] || cleanIsbn;
      return {
        title: doc.title || '未知书名',
        author: doc.author_name?.[0] || '未知作者',
        publisher: doc.publisher?.[0] || '未知出版社',
        publishYear: doc.first_publish_year || new Date().getFullYear(),
        coverUrl: isbn13 ? `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg` : '',
        pages: doc.number_of_pages_median || 0,
        isbn: cleanIsbn
      };
    }
    return null;
  } catch (error: any) {
    console.error('OpenLibrary 查询失败:', error.message);
    return null;
  }
}

/**
 * 通过 Google Books API 查询 (备用)
 */
async function queryGoogleBooks(isbn: string): Promise<BookInfo | null> {
  try {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    console.log('开始查询 Google Books, ISBN:', cleanIsbn);
    
    const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
      params: { q: `isbn:${cleanIsbn}` },
      timeout: 8000
    });

    if (response.data.items && response.data.items.length > 0) {
      const book = response.data.items[0].volumeInfo;
      return {
        title: book.title || '未知书名',
        author: book.authors?.join(', ') || '未知作者',
        publisher: book.publisher || '未知出版社',
        publishYear: book.publishedDate ? parseInt(book.publishedDate.substring(0, 4)) : new Date().getFullYear(),
        coverUrl: book.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        pages: book.pageCount || 0,
        isbn: cleanIsbn
      };
    }
    return null;
  } catch (error: any) {
    console.error('Google Books 查询失败:', error.message);
    return null;
  }
}

/**
 * 根据 ISBN 查询图书信息
 * 如果外部 API 都查不到，返回特殊状态让用户手动填写
 */
export async function getBookByISBN(isbn: string): Promise<{
  code: number;
  msg: string;
  data: BookInfo | null;
  needManual?: boolean;
}> {
  const cleanIsbn = isbn.replace(/[-\s]/g, '');
  console.log('查询 ISBN:', cleanIsbn);
  
  // 检查是否有测试数据
  if (MOCK_BOOKS[cleanIsbn]) {
    return { code: 200, msg: '获取成功', data: MOCK_BOOKS[cleanIsbn] };
  }
  
  // 先尝试 OpenLibrary (更快)
  const openlibResult = await queryOpenLibrary(cleanIsbn);
  if (openlibResult) {
    return { code: 200, msg: '获取成功', data: openlibResult };
  }
  
  // 再尝试 Google Books
  const googleResult = await queryGoogleBooks(cleanIsbn);
  if (googleResult) {
    return { code: 200, msg: '获取成功', data: googleResult };
  }

  // 全部失败，返回特殊状态让用户手动填写
  return {
    code: 404,
    msg: '未找到该图书信息，请手动填写',
    data: null,
    needManual: true
  };
}

/**
 * 搜索图书
 */
export async function searchBooks(keyword: string, limit = 10): Promise<{
  code: number;
  msg: string;
  data: Array<{
    title: string;
    author: string;
    isbn: string;
    coverUrl: string;
  }>;
}> {
  try {
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: { q: keyword, limit },
      timeout: 15000
    });

    if (response.data.docs) {
      return {
        code: 200,
        msg: '搜索成功',
        data: response.data.docs.map((doc: any) => ({
          title: doc.title || '未知书名',
          author: doc.author_name?.[0] || '未知作者',
          isbn: doc.isbn?.[0] || '',
          coverUrl: doc.isbn?.[0] ? `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg` : ''
        }))
      };
    }

    return { code: 200, msg: '搜索成功', data: [] };
  } catch (error) {
    console.error('搜索图书失败:', error);
    return { code: 500, msg: '搜索失败', data: [] };
  }
}

export default {
  getBookByISBN,
  searchBooks
};
