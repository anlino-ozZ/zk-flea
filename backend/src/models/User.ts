import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

// JWT Payload 接口
export interface JwtPayload {
  userId: number;
  username: string;
}

// 定义用户模型
class User extends Model {
    public id!: number;
    public username!: string;
    public password!: string;
    public phone!: string;
    public avatar!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true, // 用户名唯一
            comment: '用户昵称'
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '加密后的密码'
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true, // 手机号唯一
            comment: '用户手机号'
        },
        avatar: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
            comment: '用户头像地址'
        }
    },
    {
        sequelize,
        tableName: 'users' // 数据库表名
    }
);

export default User;