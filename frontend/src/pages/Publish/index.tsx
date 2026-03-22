/**
 * 商品发布页面
 * 用户发布二手商品
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, Card, message, Row, Col, Switch } from 'antd';
import { PlusOutlined, PictureOutlined } from '@ant-design/icons';
import { publishGoods } from '../../api/publish';
import type { PublishGoodsParams } from '../../api/publish';
import { getToken } from '../../api/user';
import { GoodsCondition } from '../../types/goods';
import './index.css';

const { Option } = Select;
const { TextArea } = Input;

// 新旧程度选项
const conditionOptions = [
    { value: GoodsCondition.BRAND_NEW, label: '全新' },
    { value: GoodsCondition.LIKE_NEW, label: '几乎全新' },
    { value: GoodsCondition.LIKE_NEW_3, label: '九成新' },
    { value: GoodsCondition.LIKE_NEW_4, label: '八成新' },
    { value: GoodsCondition.LIKE_NEW_5, label: '七成新及以下' }
];

// 分类选项
const categories = [
    { id: 1, name: '手机数码' },
    { id: 2, name: '潮流服饰' },
    { id: 3, name: '游戏动漫' },
    { id: 4, name: '家用电器' },
    { id: 5, name: '图书文具' },
    { id: 6, name: '运动出行' },
    { id: 7, name: '宠物用品' }
];

const PublishPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [formValues, setFormValues] = useState<any>({});
    const [isBook, setIsBook] = useState(false);

    // 检查登录
    const token = getToken();
    if (!token) {
        navigate('/login');
        return null;
    }

    // 提交表单
    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const params: PublishGoodsParams = {
                title: values.title,
                description: values.description,
                price: Math.round(values.price * 100), // 元转分
                originalPrice: Math.round(values.originalPrice * 100),
                images: imageUrls,
                categoryId: values.categoryId,
                categoryName: categories.find(c => c.id === values.categoryId)?.name || '',
                condition: values.condition || GoodsCondition.LIKE_NEW_4,
                pickupLocation: values.pickupLocation || '',
                isBook: isBook
            };

            // 如果是图书，添加图书特有字段
            if (isBook) {
                params.isbn = values.isbn || '';
                params.author = values.author || '';
                params.publisher = values.publisher || '';
                params.publishYear = values.publishYear || 0;
                params.edition = values.edition || '';
                params.language = values.language || '中文';
                params.pages = values.pages || 0;
            }

            const res = await publishGoods(params);
            if (res.code === 200) {
                message.success('商品发布成功');
                navigate(`/detail?id=${res.data.id}`);
            } else {
                message.error(res.msg || '发布失败');
            }
        } catch (error) {
            message.error('发布失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    // 图片URL添加
    const handleImageAdd = () => {
        const url = prompt('请输入图片URL:');
        if (url && url.trim()) {
            setImageUrls([...imageUrls, url.trim()]);
        }
    };

    // 图片URL移除
    const handleImageRemove = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    // 表单值变化时更新预览
    const handleValuesChange = (changedValues: any) => {
        setFormValues(prev => ({ ...prev, ...changedValues }));
    };

    // 格式化价格
    const formatPrice = (price: number) => `¥${(price || 0).toFixed(2)}`;

    // 获取分类名称
    const getCategoryName = (categoryId: number) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : '';
    };

    // 获取预览图
    const getPreviewImage = () => {
        if (imageUrls.length > 0) return imageUrls[0];
        return null;
    };

    return (
        <div className="publish-container">
            <Card className="publish-card" title="发布商品">
                <div className="publish-content">
                    {/* 左侧表单 */}
                    <div className="publish-form-section">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            onValuesChange={handleValuesChange}
                            initialValues={{
                                price: 0.01,
                                originalPrice: 0.01
                            }}
                        >
                            {/* 商品标题 */}
                            <Form.Item
                                name="title"
                                label="商品标题"
                                rules={[
                                    { required: true, message: '请输入商品标题' },
                                    { max: 100, message: '标题不能超过100字' }
                                ]}
                            >
                                <Input placeholder="请输入商品标题" maxLength={100} showCount />
                            </Form.Item>

                            {/* 商品分类 */}
                            <Form.Item
                                name="categoryId"
                                label="商品分类"
                                rules={[{ required: true, message: '请选择商品分类' }]}
                            >
                                <Select placeholder="请选择分类">
                                    {categories.map(cat => (
                                        <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            {/* 价格 */}
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="price"
                                        label="售价（元）"
                                        rules={[
                                            { required: true, message: '请输入售价' },
                                            { type: 'number', min: 0.01, message: '价格不能小于0.01' }
                                        ]}
                                    >
                                        <InputNumber
                                            placeholder="请输入售价"
                                            style={{ width: '100%' }}
                                            min={0.01}
                                            precision={2}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="originalPrice"
                                        label="原价（元）"
                                        rules={[
                                            { required: true, message: '请输入原价' },
                                            { type: 'number', min: 0.01, message: '原价不能小于0.01' }
                                        ]}
                                    >
                                        <InputNumber
                                            placeholder="请输入原价"
                                            style={{ width: '100%' }}
                                            min={0.01}
                                            precision={2}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* 商品图片 */}
                            <Form.Item label="商品图片" required>
                                <div className="image-list">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="image-item">
                                            <img src={url} alt={`商品图片${index + 1}`} />
                                            <Button
                                                type="link"
                                                danger
                                                size="small"
                                                onClick={() => handleImageRemove(index)}
                                            >
                                                删除
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="image-upload-btn" onClick={handleImageAdd}>
                                        <PlusOutlined />
                                        <span>添加图片</span>
                                    </div>
                                </div>
                                <div className="image-tip">
                                    点击添加图片按钮输入图片链接，支持多张图片
                                </div>
                            </Form.Item>

                            {/* 新旧程度和自提地点 */}
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="condition"
                                        label="新旧程度"
                                    >
                                        <Select placeholder="请选择新旧程度" allowClear>
                                            {conditionOptions.map(opt => (
                                                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        name="pickupLocation"
                                        label="自提地点"
                                    >
                                        <Input placeholder="请输入自提地点" maxLength={255} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            {/* 是否为图书 */}
                            <Form.Item label="是否为图书">
                                <Switch
                                    checked={isBook}
                                    onChange={(checked) => setIsBook(checked)}
                                    checkedChildren="是"
                                    unCheckedChildren="否"
                                />
                                <span style={{ marginLeft: 8, color: '#666' }}>
                                    {isBook ? '将显示图书相关信息' : '普通商品'}
                                </span>
                            </Form.Item>

                            {/* 图书特有字段 */}
                            {isBook && (
                                <div className="book-fields" style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="isbn" label="ISBN">
                                                <Input placeholder="请输入ISBN" maxLength={20} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="author" label="作者">
                                                <Input placeholder="请输入作者" maxLength={100} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="publisher" label="出版社">
                                                <Input placeholder="请输入出版社" maxLength={100} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="publishYear" label="出版年份">
                                                <InputNumber
                                                    placeholder="如: 2024"
                                                    style={{ width: '100%' }}
                                                    min={1900}
                                                    max={2030}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col span={8}>
                                            <Form.Item name="edition" label="版次">
                                                <Input placeholder="如: 第1版" maxLength={50} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="language" label="语言">
                                                <Select placeholder="请选择语言" allowClear>
                                                    <Option value="中文">中文</Option>
                                                    <Option value="英文">英文</Option>
                                                    <Option value="其他">其他</Option>
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={8}>
                                            <Form.Item name="pages" label="页数">
                                                <InputNumber
                                                    placeholder="请输入页数"
                                                    style={{ width: '100%' }}
                                                    min={1}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* 商品描述 */}
                            <Form.Item
                                name="description"
                                label="商品描述"
                                rules={[
                                    { required: true, message: '请输入商品描述' },
                                    { max: 2000, message: '描述不能超过2000字' }
                                ]}
                            >
                                <TextArea
                                    placeholder="请详细描述商品的情况、新旧程度、使用说明等"
                                    rows={6}
                                    maxLength={2000}
                                    showCount
                                />
                            </Form.Item>

                            {/* 提交按钮 */}
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="submit-btn"
                                    size="large"
                                >
                                    发布商品
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                    {/* 右侧预览 */}
                    <div className="publish-preview-section">
                        <Card className="preview-card" title="商品预览">
                            <div className="preview-content">
                                <div className="preview-image">
                                    {getPreviewImage() ? (
                                        <img src={getPreviewImage()!} alt="商品预览" />
                                    ) : (
                                        <>
                                            <PictureOutlined style={{ fontSize: 48, color: '#ccc' }} />
                                            <span style={{ marginTop: 8, color: '#999' }}>暂无图片</span>
                                        </>
                                    )}
                                </div>
                                <div className="preview-title">
                                    {formValues.title || '商品标题'}
                                </div>
                                <div className="preview-price">
                                    <span className="preview-current-price">
                                        {formatPrice(formValues.price)}
                                    </span>
                                    {formValues.originalPrice > formValues.price && (
                                        <span className="preview-original-price">
                                            {formatPrice(formValues.originalPrice)}
                                        </span>
                                    )}
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <span style={{
                                        background: '#e8f4e0',
                                        color: '#389e0d',
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        fontSize: 12
                                    }}>
                                        {getCategoryName(formValues.categoryId) || '未选择分类'}
                                    </span>
                                </div>
                                <div className="preview-description">
                                    {formValues.description || '商品描述将在此处显示...'}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PublishPage;
