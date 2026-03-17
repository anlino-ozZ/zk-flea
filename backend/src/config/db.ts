// 引入 Sequelize（ORM 工具，简化 MySQL 操作）
import { Sequelize } from 'sequelize';

// 配置 MySQL 连接信息（新手只改 password 就行）
const sequelize = new Sequelize(
    'zk_flea_db',
    'root',
    'Zal13715002181,',
    {
        host: 'localhost', // 本地数据库（不用改）
        dialect: 'mysql',  // 数据库类型（不用改）
        port: 3306,        // MySQL 默认端口（不用改）
        timezone: '+08:00',// 时区（解决时间差问题）
        define: {
            timestamps: true, // 自动添加 createdAt/updatedAt 字段
            underscored: true // 表名/字段名用下划线（符合 MySQL 规范）
        },
        pool: {
            max: 5,    // 连接池最大连接数
            min: 0,    // 最小连接数
            idle: 10000// 空闲连接超时时间
        }
    }
);

// 测试 MySQL 连接
async function testDbConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL 连接成功！');
    } catch (error) {
        console.error('❌ MySQL 连接失败：', error);
    }
}

// 执行连接测试
testDbConnection();

// 同步模型到数据库（开发环境用，生产环境慎用）
// force: false = 不删除已有表，只新增/修改；true = 清空表重建（慎用）
sequelize.sync({ force: false }).then(() => {
    console.log('✅ 数据库表同步完成！');
});

export default sequelize;