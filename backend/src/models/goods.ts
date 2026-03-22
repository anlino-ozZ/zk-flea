import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './User';

/**
 * 商品状态枚举
 * 0: 在售 - 商品正常展示，可购买
 * 1: 交易中 - 已有买家，正在交易流程中
 * 2: 已售出 - 交易完成
 * 3: 已下架 - 卖家主动下架
 */
export enum GoodsStatus {
    ON_SALE = 0,      // 在售
    TRADING = 1,      // 交易中
    SOLD = 2,         // 已售出
    OFF_SHELF = 3     // 已下架
}

/**
 * 商品新旧程度枚举
 * 1: 全新 - 未使用
 * 2: 几乎全新 - 使用过几次
 * 3: 九成新
 * 4: 八成新
 * 5: 七成新及以下
 */
export enum GoodsCondition {
    BRAND_NEW = 1,    // 全新
    LIKE_NEW = 2,     // 几乎全新
    LIKE_NEW_3 = 3,   // 九成新
    LIKE_NEW_4 = 4,   // 八成新
    LIKE_NEW_5 = 5    // 七成新及以下
}

// 定义商品模型
class Goods extends Model {
    public id!: number;
    public title!: string;
    public description!: string;
    public price!: number;
    public originalPrice!: number;
    public images!: string;
    public categoryId!: number;
    public categoryName!: string;
    public sellerId!: number;
    public sellerName!: string;
    public sellerAvatar!: string;
    public status!: GoodsStatus;
    public condition!: GoodsCondition;
    public pickupLocation!: string;
    public isBook!: boolean;
    public viewCount!: number;
    public favoriteCount!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Goods.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '商品标题'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: '商品描述'
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '售价（分）'
        },
        originalPrice: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '原价（分）'
        },
        images: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: '商品图片地址（JSON字符串）',
            get() {
                const value = this.getDataValue('images');
                return value ? JSON.parse(value) : [];
            },
            set(value: string[]) {
                this.setDataValue('images', JSON.stringify(value));
            }
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '分类ID'
        },
        categoryName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '分类名称'
        },
        sellerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: '卖家ID'
        },
        sellerName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '卖家昵称'
        },
        sellerAvatar: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
            comment: '卖家头像'
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: GoodsStatus.ON_SALE,
            comment: '商品状态: 0-在售, 1-交易中, 2-已售出, 3-已下架'
        },
        condition: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: GoodsCondition.LIKE_NEW_4,
            comment: '新旧程度: 1-全新, 2-几乎全新, 3-九成新, 4-八成新, 5-七成新及以下'
        },
        pickupLocation: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
            comment: '自提地点'
        },
        isBook: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: '是否为图书'
        },
        viewCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '浏览量'
        },
        favoriteCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '收藏数'
        }
    },
    {
        sequelize,
        tableName: 'goods',
        timestamps: true,
        underscored: true
    }
);

// 关联用户表（一个用户可发布多个商品）
User.hasMany(Goods, { foreignKey: 'sellerId', as: 'goods' });
Goods.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// 导出类型
export type GoodsAttributes = {
    id: number;
    title: string;
    description: string;
    price: number;
    originalPrice: number;
    images: string[];
    categoryId: number;
    categoryName: string;
    sellerId: number;
    sellerName: string;
    sellerAvatar: string;
    status: GoodsStatus;
    condition: GoodsCondition;
    pickupLocation: string;
    isBook: boolean;
    viewCount: number;
    favoriteCount: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export type GoodsCreationAttributes = Omit<GoodsAttributes, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'favoriteCount'>;

export default Goods;
