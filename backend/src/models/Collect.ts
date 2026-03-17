import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './User';
import Goods from './goods';

// 定义收藏模型
class Collect extends Model {
    public id!: number;
    public userId!: number;
    public goodsId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Collect.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '用户ID',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        goodsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '商品ID',
            references: {
                model: 'goods',
                key: 'id'
            }
        }
    },
    {
        sequelize,
        tableName: 'collects',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['user_id', 'goods_id'] // 联合唯一索引
            }
        ]
    }
);

// 关联用户表（一个用户可收藏多个商品）
User.hasMany(Collect, { foreignKey: 'userId', as: 'collects' });
Collect.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 关联商品表（一个商品可被多个用户收藏）
Goods.hasMany(Collect, { foreignKey: 'goodsId', as: 'collects' });
Collect.belongsTo(Goods, { foreignKey: 'goodsId', as: 'goods' });

/**
 * 添加收藏
 */
export async function addCollect(userId: number, goodsId: number): Promise<Collect | null> {
    // 检查是否已收藏
    const existing = await Collect.findOne({ where: { userId, goodsId } });
    if (existing) {
        return null;
    }
    
    const collect = await Collect.create({ userId, goodsId });
    return collect;
}

/**
 * 取消收藏
 */
export async function removeCollect(userId: number, goodsId: number): Promise<boolean> {
    const result = await Collect.destroy({ where: { userId, goodsId } });
    return result > 0;
}

/**
 * 检查是否已收藏
 */
export async function isCollected(userId: number, goodsId: number): Promise<boolean> {
    const collect = await Collect.findOne({ where: { userId, goodsId } });
    return !!collect;
}

/**
 * 获取用户的收藏列表
 */
export async function getUserCollects(userId: number): Promise<Collect[]> {
    return await Collect.findAll({ where: { userId } });
}

/**
 * 获取用户收藏的商品ID列表
 */
export async function getUserCollectGoodsIds(userId: number): Promise<number[]> {
    const collects = await Collect.findAll({ where: { userId }, attributes: ['goodsId'] });
    return collects.map(c => c.goodsId);
}

// 导出类型
export type CollectAttributes = {
    id: number;
    userId: number;
    goodsId: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export type CollectCreationAttributes = Omit<CollectAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export default Collect;
