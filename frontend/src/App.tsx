import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import HomePage from './pages/home';
import ProfilePage from './pages/profile';
import GoodsListPage from './pages/goods';
import DetailPage from './pages/Detail';
import PublishPage from './pages/Publish';
import './App.css';

// 自定义校园主题（校徽蓝为例，可改）
const theme = {
  token: {
    colorPrimary: '#0066CC',
    fontSizeBase: 14,
  },
};

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/goods" element={<GoodsListPage />} />
          <Route path="/detail" element={<DetailPage />} />
          <Route path="/publish" element={<PublishPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
}

export default App;