import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import User from './User';

// 复用你定义的商品状态枚举（和前端保持一致）
export enum GoodsStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    ON_SALE = 'on_sale',
    SOLD = 'sold',
    OFF_SHELF = 'off_shelf'
}

// 定义商品模型（完全对齐你的 Goods 接口）
class Goods extends Model {
    public id!: number;
    public title!: string;
    public description!: string;
    public price!: number;
    public originalPrice!: number;
    public images!: string; // 数据库存JSON字符串，取出来转数组
    public categoryId!: number;
    public categoryName!: string;
    public sellerId!: number;
    public sellerName!: string;
    public sellerAvatar!: string;
    public status!: GoodsStatus;
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
            type: DataTypes.INTEGER, // 你用的是分单位（699900 = 6999元），用INT更合适
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
            // 自动把数组转JSON存，取出来转数组
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
            type: DataTypes.ENUM(...Object.values(GoodsStatus)),
            allowNull: false,
            defaultValue: GoodsStatus.ON_SALE,
            comment: '商品状态'
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
        timestamps: true, // 自动生成createdAt/updatedAt
        underscored: true
    }
);

// 关联用户表（一个用户可发布多个商品）
User.hasMany(Goods, { foreignKey: 'sellerId', as: 'goods' });
Goods.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

export default Goods;