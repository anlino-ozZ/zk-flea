/**
 * 图书查询服务
 * 使用 Node.js fetch API 调用外部图书 API
 */

// 使用 OpenLibrary API（相对稳定）
const OPENLIB_API = 'https://openlibrary.org';

/**
 * 通过 OpenLibrary API 查询图书信息
 */
async function queryOpenLibrary(isbn: string): Promise<{
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  coverUrl: string;
  pages: number;
  isbn: string;
} | null> {
  try {
    console.log('正在查询 OpenLibrary API, ISBN:', isbn);
    
    const response = await fetch(`${OPENLIB_API}/api/books/v1/volumes?isbn=${isbn}`, {
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.log('OpenLibrary API 响应失败:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const book = data.items[0].volumeInfo;
      return {
        title: book.title || '未知书名',
        author: book.authors ? book.authors.join(', ') : '未知作者',
        publisher: book.publisher || '未知出版社',
        publishYear: book.publishedDate ? parseInt(book.publishedDate.substring(0, 4)) : new Date().getFullYear(),
        coverUrl: book.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        pages: book.pageCount || 0,
        isbn: isbn
      };
    }
    
    return null;
  } catch (error: any) {
    console.error('OpenLibrary API 查询失败:', error.message);
    return null;
  }
}

/**
 * 通过 OpenLibrary 旧版 API 查询图书信息
 */
async function queryOpenLibraryLegacy(isbn: string): Promise<{
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  coverUrl: string;
  pages: number;
  isbn: string;
} | null> {
  try {
    console.log('正在查询 OpenLibrary 旧版 API, ISBN:', isbn);
    
    const response = await fetch(`${OPENLIB_API}/isbn/${isbn}.json`, {
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      console.log('OpenLibrary 旧版 API 响应失败:', response.status);
      return null;
    }

    const book = await response.json();

    // 获取作者信息
    let authorName = '未知作者';
    if (book.authors && book.authors.length > 0) {
      try {
        const authorKey = book.authors[0].key;
        const authorRes = await fetch(`${OPENLIB_API}${authorKey}.json`, {
          signal: AbortSignal.timeout(5000)
        });
        if (authorRes.ok) {
          const authorData = await authorRes.json();
          authorName = authorData.name || '未知作者';
        }
      } catch {
        authorName = '未知作者';
      }
    }

    // 获取出版信息
    const publishYear = book.publish_date 
      ? parseInt(book.publish_date.replace(/\D/g, '')) || new Date().getFullYear()
      : new Date().getFullYear();

    const publisher = book.publishers && book.publishers.length > 0 
      ? book.publishers[0] 
      : '未知出版社';

    // 封面图片
    const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

    // 页数
    const pages = book.number_of_pages || 0;

    return {
      title: book.title || '未知书名',
      author: authorName,
      publisher: publisher,
      publishYear: publishYear,
      coverUrl: coverUrl,
      pages: pages,
      isbn: isbn
    };
  } catch (error: any) {
    console.error('OpenLibrary 旧版 API 查询失败:', error.message);
    return null;
  }
}

/**
 * 根据 ISBN 查询图书信息（优先使用新版 API，备用旧版 API）
 * @param isbn - ISBN 码
 * @returns 图书信息或 null
 */
export async function getBookByISBN(isbn: string): Promise<{
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  coverUrl: string;
  pages: number;
  isbn: string;
} | null> {
  // 先尝试新版 API
  const result = await queryOpenLibrary(isbn);
  if (result) {
    return result;
  }

  // 备用旧版 API
  const legacyResult = await queryOpenLibraryLegacy(isbn);
  if (legacyResult) {
    return legacyResult;
  }

  return null;
}

/**
 * 搜索图书（通过关键词）
 * @param keyword - 关键词
 * @returns 图书列表
 */
export async function searchBooks(keyword: string, limit = 10): Promise<Array<{
  title: string;
  author: string;
  isbn: string;
  coverUrl: string;
}>> {
  try {
    console.log('正在搜索图书, 关键词:', keyword);
    
    const response = await fetch(
      `${OPENLIB_API}/search.json?q=${encodeURIComponent(keyword)}&limit=${limit}`,
      { signal: AbortSignal.timeout(15000) }
    );

    if (!response.ok) {
      console.log('搜索 API 响应失败:', response.status);
      return [];
    }

    const data = await response.json();

    if (data.docs) {
      return data.docs.map((doc: any) => ({
        title: doc.title || '未知书名',
        author: doc.author_name ? doc.author_name[0] : '未知作者',
        isbn: doc.isbn ? doc.isbn[0] : '',
        coverUrl: doc.isbn 
          ? `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`
          : ''
      }));
    }

    return [];
  } catch (error: any) {
    console.error('搜索图书失败:', error.message);
    return [];
  }
}

export default {
  getBookByISBN,
  searchBooks
};
