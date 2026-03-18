import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './User';
import Goods from './goods';

// 定义留言模型
class Message extends Model {
    public id!: number;
    public userId!: number;
    public goodsId!: number;
    public content!: string;
    public parentId!: number | null;  // 父留言ID，null为顶层留言
    public replyToUserId!: number | null;  // 回复目标用户ID
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '留言用户ID',
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
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: '留言内容'
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            comment: '父留言ID，null为顶层留言'
        },
        replyToUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
            comment: '回复目标用户ID'
        }
    },
    {
        sequelize,
        tableName: 'messages',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['goods_id', 'created_at']  // 商品留言列表索引
            },
            {
                fields: ['parent_id']  // 回复列表索引
            }
        ]
    }
);

// 关联用户表
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });

// 关联商品表
Goods.hasMany(Message, { foreignKey: 'goodsId', as: 'messages' });
Message.belongsTo(Goods, { foreignKey: 'goodsId', as: 'goods', constraints: false });

// 自关联：留言的回复
Message.hasMany(Message, { foreignKey: 'parentId', as: 'replies' });
Message.belongsTo(Message, { foreignKey: 'parentId', as: 'parent', constraints: false });

// 导出类型
export type MessageAttributes = {
    id: number;
    userId: number;
    goodsId: number;
    content: string;
    parentId: number | null;
    replyToUserId: number | null;
    createdAt?: Date;
    updatedAt?: Date;
};

export type MessageCreationAttributes = Omit<MessageAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export default Message;
