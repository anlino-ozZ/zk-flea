/**
 * 商品发布页面
 * 用户发布二手商品
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, Card, message, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { publishGoods } from '../../api/publish';
import type { PublishGoodsParams } from '../../api/publish';
import { getToken } from '../../api/user';
import './index.css';

const { Option } = Select;
const { TextArea } = Input;

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
                categoryName: categories.find(c => c.id === values.categoryId)?.name || ''
            };

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

    return (
        <div className="publish-container">
            <Card className="publish-card" title="发布商品">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
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
                            <Button icon={<PlusOutlined />} onClick={handleImageAdd}>
                                添加图片URL
                            </Button>
                        </div>
                        <div className="image-tip">
                            点击"添加图片URL"输入图片链接，支持多张图片
                        </div>
                    </Form.Item>

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
                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            发布商品
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default PublishPage;
