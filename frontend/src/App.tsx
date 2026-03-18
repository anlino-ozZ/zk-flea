import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { HashRouter, useRoutes } from 'react-router-dom';
import routes from './router';
import NavBar from './components/NavBar';
import './assets/styles/global.less';

// 绿色主题配置
const greenTheme = {
  token: {
    colorPrimary: '#52c41a',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    colorTextBase: '#333333',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fff5',
    borderRadius: 4,
    fontFamily: '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif',
  },
  components: {
    Button: {
      primaryColor: '#52c41a',
      colorPrimary: '#52c41a',
      colorPrimaryHover: '#389e0d',
      colorPrimaryActive: '#2d7a0a',
    },
    Input: {
      colorPrimary: '#52c41a',
      colorPrimaryHover: '#389e0d',
      activeBorderColor: '#52c41a',
      hoverBorderColor: '#a7d967',
    },
    Select: {
      colorPrimary: '#52c41a',
      colorPrimaryHover: '#389e0d',
    },
    DatePicker: {
      colorPrimary: '#52c41a',
      colorPrimaryHover: '#389e0d',
    },
    Menu: {
      colorPrimary: '#52c41a',
      itemSelectedBg: '#e8f4e0',
      itemSelectedColor: '#52c41a',
      itemHoverColor: '#52c41a',
    },
    Table: {
      colorPrimary: '#52c41a',
      headerBg: '#f8fff5',
    },
    Pagination: {
      colorPrimary: '#52c41a',
      itemActiveBg: '#52c41a',
    },
    Card: {
      colorPrimary: '#52c41a',
    },
    Tag: {
      colorSuccessBg: '#e8f4e0',
      colorSuccessBorder: '#a7d967',
      colorSuccess: '#389e0d',
    },
  },
};

// 路由内容组件
const AppContent: React.FC = () => {
  const element = useRoutes(routes);
  return (
    <>
      <NavBar />
      {element}
    </>
  );
};

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={greenTheme}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ConfigProvider>
  );
}

export default App;
