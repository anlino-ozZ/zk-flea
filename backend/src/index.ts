import express from 'express';
import cors from 'cors';
import path from 'path';
import './config/db';
import './models/User';
import './models/goods';
import './models/BookInfo';
import './models/Collect';
import './models/Message';
import goodsRouter from './routes/goods';
import userRouter from './routes/user';
import collectRouter from './routes/collect';
import messageRouter from './routes/message';
import publishRouter from './routes/publish';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

// 初始化Express
const app = express();
const PORT = 3001; // 前端3000，后端用3001避免冲突

// 中间件配置
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // 静态托管上传的图片

// HTTP 请求日志中间件
app.use(logger.httpLogger());

// 测试接口（验证后端是否启动）
app.get('/api/test', (req, res) => {
    res.json({ code: 200, msg: '后端服务正常', data: null });
});

// 用户相关路由
app.use('/api/user', userRouter);

// 商品相关路由
app.use('/api/goods', goodsRouter);

// 收藏相关路由
app.use('/api/collect', collectRouter);

// 留言相关路由
app.use('/api/message', messageRouter);

// 商品发布相关路由
app.use('/api/publish', publishRouter);

// 404 处理
app.use(notFoundHandler);

// 全局错误处理（必须放在最后）
app.use(errorHandler);

// 启动服务
app.listen(PORT, () => {
    console.log(`后端服务运行在：http://localhost:${PORT}`);
});