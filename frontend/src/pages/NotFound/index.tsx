/**
 * 404 页面
 * 页面不存在时显示
 */

import { Link } from 'react-router-dom';
import { Button, Result } from 'antd';

const NotFoundPage: React.FC = () => {
  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: '#f8fff5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在"
        extra={
          <Link to="/">
            <Button type="primary" size="large">
              返回首页
            </Button>
          </Link>
        }
      />
    </div>
  );
};

export default NotFoundPage;
