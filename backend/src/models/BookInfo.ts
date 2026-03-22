import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';
import Goods from './goods';

/**
 * 图书信息模型
 * 存储图书特有信息，与Goods表一对一关联
 */
class BookInfo extends Model {
    public id!: number;
    public goodsId!: number;
    public isbn!: string;
    public author!: string;
    public publisher!: string;
    public publishYear!: number;
    public edition!: string;
    public language!: string;
    public pages!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

BookInfo.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        goodsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            comment: '关联的商品ID',
            references: {
                model: 'goods',
                key: 'id'
            }
        },
        isbn: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'ISBN国际标准书号'
        },
        author: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: '作者'
        },
        publisher: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: '出版社'
        },
        publishYear: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '出版年份'
        },
        edition: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: '版次'
        },
        language: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: '中文',
            comment: '语言'
        },
        pages: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '页数'
        }
    },
    {
        sequelize,
        tableName: 'book_infos',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['goods_id']
            }
        ]
    }
);

// 关联Goods表
Goods.hasOne(BookInfo, { foreignKey: 'goodsId', as: 'bookInfo' });
BookInfo.belongsTo(Goods, { foreignKey: 'goodsId', as: 'goods' });

// 导出类型
export type BookInfoAttributes = {
    id: number;
    goodsId: number;
    isbn: string;
    author: string;
    publisher: string;
    publishYear: number;
    edition: string;
    language: string;
    pages: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export type BookInfoCreationAttributes = Omit<BookInfoAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export default BookInfo;
