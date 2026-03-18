/**
 * 日志工具
 * 记录接口请求/错误日志，按日期生成日志文件
 */

import fs from 'fs';
import path from 'path';

// 日志目录
const LOG_DIR = path.join(__dirname, '../../logs');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 获取当前日期的日志文件名
function getLogFileName(date: Date = new Date()): string {
  const dateStr = date.toISOString().split('T')[0];
  return `app-${dateStr}.log`;
}

// 写入日志文件
function writeLog(level: string, message: string, meta?: any): void {
  const now = new Date();
  const timestamp = now.toISOString();
  const logFile = path.join(LOG_DIR, getLogFileName(now));
  
  let logContent = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (meta) {
    if (meta.stack) {
      logContent += `\nStack: ${meta.stack}`;
    }
    if (typeof meta === 'object') {
      try {
        logContent += `\nMeta: ${JSON.stringify(meta)}`;
      } catch {
        logContent += `\nMeta: [Object cannot be stringified]`;
      }
    }
  }
  logContent += '\n';

  fs.appendFileSync(logFile, logContent);
}

// 格式化请求日志
function formatRequestLog(req: any): string {
  const { method, url, query, body, headers } = req;
  // 隐藏敏感信息
  const sanitizedHeaders = { ...headers };
  if (sanitizedHeaders.authorization) {
    sanitizedHeaders.authorization = 'Bearer ***';
  }
  
  return `Method: ${method}, URL: ${url}, Query: ${JSON.stringify(query)}, Body: ${JSON.stringify(body)}, Headers: ${JSON.stringify(sanitizedHeaders)}`;
}

// Logger 对象
export const logger = {
  // 信息日志
  info(message: string, meta?: any): void {
    console.log(`[INFO] ${message}`, meta || '');
    writeLog('info', message, meta);
  },

  // 警告日志
  warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${message}`, meta || '');
    writeLog('warn', message, meta);
  },

  // 错误日志
  error(message: string, meta?: any): void {
    console.error(`[ERROR] ${message}`, meta || '');
    writeLog('error', message, meta);
  },

  // HTTP 请求日志中间件
  httpLogger(): (req: any, res: any, next: any) => void {
    return (req: any, res: any, next: any) => {
      const startTime = Date.now();
      const requestInfo = formatRequestLog(req);

      // 请求开始
      logger.info(`→ ${requestInfo}`);

      // 拦截响应
      const originalSend = res.send;
      res.send = function (data: any) {
        const responseTime = Date.now() - startTime;
        let responseData = data;
        try {
          if (typeof data === 'string') {
            responseData = JSON.parse(data);
          }
        } catch {}

        const logLevel = res.statusCode >= 400 ? 'error' : 'info';
        const logMessage = `← ${req.method} ${req.url} - Status: ${res.statusCode} - Time: ${responseTime}ms`;
        
        if (logLevel === 'error') {
          logger.error(logMessage, { 
            request: requestInfo, 
            response: responseData,
            responseTime 
          });
        } else {
          logger.info(logMessage, { responseTime });
        }

        return originalSend.call(this, data);
      };

      next();
    };
  }
};

export default logger;
