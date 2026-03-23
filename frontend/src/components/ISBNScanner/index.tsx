/**
 * ISBN 扫码组件
 * 支持扫码、手动输入ISBN、手动填写图书信息
 */

import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, message, Spin, Input, Form } from 'antd';
import { ScanOutlined, CameraOutlined, BookOutlined, EditOutlined } from '@ant-design/icons';
import { getBookByISBN, type BookInfo } from '../../api/book';

interface ISBNScannerProps {
  onSuccess: (bookInfo: BookInfo) => void;
  onSkip?: () => void;
}

// 全局扫码实例
let html5QrcodeScanner: any = null;

const ISBNScanner: React.FC<ISBNScannerProps> = ({ onSuccess, onSkip }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showManualFill, setShowManualFill] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scannedIsbn, setScannedIsbn] = useState('');
  const [form] = Form.useForm();
  const isScanningRef = useRef(false);

  const startScanning = async () => {
    if (isScanningRef.current) return;
    
    setError(null);
    setScanSuccess(false);
    isScanningRef.current = true;

    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      
      html5QrcodeScanner = new Html5QrcodeScanner(
        'isbn-scanner-container',
        { fps: 10, qrbox: { width: 280, height: 160 }, aspectRatio: 1.6 },
        false
      );

      html5QrcodeScanner.render(
        async (decodedText: string) => {
          if (!isScanningRef.current) return;
          
          console.log('识别到ISBN:', decodedText);
          isScanningRef.current = false;
          
          try {
            html5QrcodeScanner.clear();
          } catch (e) {}
          html5QrcodeScanner = null;

          setScanSuccess(true);
          setScannedIsbn(decodedText);
          await fetchBookInfo(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      console.error('扫码错误:', err);
      isScanningRef.current = false;
      setError(err?.message || '摄像头启动失败');
    }
  };

  const stopScanning = () => {
    isScanningRef.current = false;
    try {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
        html5QrcodeScanner = null;
      }
    } catch (e) {}
  };

  const fetchBookInfo = async (isbn: string) => {
    setLoading(true);
    try {
      const res = await getBookByISBN(isbn);
      if (res.code === 200 && res.data) {
        message.success('查询成功！');
        onSuccess(res.data);
        setVisible(false);
      } else {
        // API查不到，提示用户手动填写
        message.info('未找到图书信息，请手动填写');
        setShowManualFill(true);
        form.setFieldsValue({ isbn: isbn });
      }
    } catch (err) {
      console.error('查询失败:', err);
      message.error('查询失败，请手动填写');
      setShowManualFill(true);
      form.setFieldsValue({ isbn: isbn });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualInput.trim()) {
      message.warning('请输入ISBN码');
      return;
    }
    setScannedIsbn(manualInput.trim());
    await fetchBookInfo(manualInput.trim());
  };

  const handleManualFillSubmit = async (values: any) => {
    const bookInfo: BookInfo = {
      title: values.title || '未知书名',
      author: values.author || '未知作者',
      publisher: values.publisher || '未知出版社',
      publishYear: values.publishYear || new Date().getFullYear(),
      coverUrl: values.coverUrl || '',
      pages: values.pages > 0 ? values.pages : 1,
      isbn: values.isbn || scannedIsbn
    };
    message.success('添加成功！');
    onSuccess(bookInfo);
    handleClose();
  };

  const handleClose = () => {
    stopScanning();
    setVisible(false);
    setError(null);
    setShowManualInput(false);
    setShowManualFill(false);
    setManualInput('');
    setScanSuccess(false);
    setScannedIsbn('');
    form.resetFields();
  };

  useEffect(() => {
    return () => stopScanning();
  }, []);

  return (
    <>
      <Button
        type="primary"
        icon={<ScanOutlined />}
        onClick={() => { setVisible(true); setTimeout(startScanning, 300); }}
        style={{ marginLeft: 8 }}
      >
        扫码卖书
      </Button>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CameraOutlined />
            <span>扫描图书ISBN</span>
          </div>
        }
        open={visible}
        onCancel={handleClose}
        width={520}
        footer={null}
        destroyOnHidden
        style={{ top: 80 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#666' }}>正在查询图书信息...</p>
          </div>
        ) : showManualFill ? (
          // 手动填写图书信息
          <Form form={form} layout="vertical" onFinish={handleManualFillSubmit}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <EditOutlined style={{ fontSize: 36, color: '#1890ff' }} />
              <p style={{ color: '#666', marginTop: 8 }}>手动填写图书信息</p>
            </div>

            <Form.Item name="isbn" label="ISBN" rules={[{ required: true, message: '请输入ISBN' }]}>
              <Input placeholder="图书ISBN码" maxLength={13} />
            </Form.Item>

            <Form.Item name="title" label="书名" rules={[{ required: true, message: '请输入书名' }]}>
              <Input placeholder="请输入书名" />
            </Form.Item>

            <Form.Item name="author" label="作者">
              <Input placeholder="请输入作者" />
            </Form.Item>

            <Form.Item name="publisher" label="出版社">
              <Input placeholder="请输入出版社" />
            </Form.Item>

            <Form.Item name="publishYear" label="出版年份">
              <Input type="number" placeholder="如：2024" />
            </Form.Item>

            <Form.Item name="pages" label="页数">
              <Input type="number" placeholder="请输入页数" />
            </Form.Item>

            <Form.Item name="coverUrl" label="封面图片URL">
              <Input placeholder="图片网址（可选）" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large">
                确认添加
              </Button>
            </Form.Item>

            <Button 
              type="link" 
              onClick={() => { setShowManualFill(false); setShowManualInput(true); }}
              block
            >
              返回输入ISBN
            </Button>
          </Form>
        ) : showManualInput ? (
          // 手动输入ISBN
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: 24, textAlign: 'center' }}>
              <BookOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <p style={{ color: '#666' }}>手动输入ISBN码</p>
            </div>
            
            <Input.Search
              size="large"
              placeholder="请输入ISBN码"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onSearch={handleManualSubmit}
              enterButton="查询"
              maxLength={13}
            />
            
            {error && (
              <div style={{ color: '#ff4d4f', marginTop: 16, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <Button 
              type="link" 
              onClick={() => {
                setShowManualInput(false);
                setError(null);
                setTimeout(startScanning, 300);
              }}
              block
              style={{ marginTop: 16 }}
            >
              返回扫码
            </Button>
          </div>
        ) : (
          // 扫码模式
          <div style={{ padding: '10px 0' }}>
            <div 
              id="isbn-scanner-container"
              style={{ 
                marginBottom: 20,
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />

            {scanSuccess && (
              <div style={{ 
                color: '#52c41a', 
                marginBottom: 16, 
                padding: 12, 
                background: '#f6ffed', 
                borderRadius: 8,
                textAlign: 'center',
                border: '1px solid #b7eb8f'
              }}>
                识别成功！正在查询...
              </div>
            )}

            {error && (
              <div style={{ 
                color: '#ff4d4f', 
                marginBottom: 16, 
                padding: 12, 
                background: '#fff2f0', 
                borderRadius: 8,
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <Button 
                size="large"
                icon={<ScanOutlined />}
                onClick={startScanning}
                type="primary"
                block
                style={{ height: 48, fontSize: 16 }}
                disabled={isScanningRef.current}
              >
                {scanSuccess ? '重新扫码' : '开始扫码'}
              </Button>
              
              <Button 
                size="large"
                icon={<BookOutlined />}
                onClick={() => { stopScanning(); setShowManualInput(true); }}
                block
                style={{ height: 48, fontSize: 16 }}
              >
                手动输入
              </Button>
            </div>

            <p style={{ marginTop: 20, color: '#999', fontSize: 13, textAlign: 'center', marginBottom: 0 }}>
              请将图书背面的 ISBN 条形码对准扫描框
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ISBNScanner;
