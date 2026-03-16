import express from 'express';
import cors from 'cors';
import path from 'path';
import goodsRouter from './routes/goods';
import userRouter from './routes/user';

// 初始化Express
const app = express();
const PORT = 3001; // 前端3000，后端用3001避免冲突

// 中间件配置
app.use(cors()); // 允许跨域
app.use(express.json()); // 解析JSON请求体
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // 静态托管上传的图片

// 测试接口（验证后端是否启动）
app.get('/api/test', (req, res) => {
    res.json({ code: 200, msg: '后端服务正常', data: null });
});

// 用户相关路由
app.use('/api/user', userRouter);

// 商品相关路由
app.use('/api/goods', goodsRouter);

// 启动服务
app.listen(PORT, () => {
    console.log(`后端服务运行在：http://localhost:${PORT}`);
});