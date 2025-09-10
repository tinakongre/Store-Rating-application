import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false
});
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(200), allowNull: false },
  address: { type: DataTypes.STRING(500), allowNull: true },
  role: { type: DataTypes.ENUM('admin','user','owner'), defaultValue: 'user' }
});
const Store = sequelize.define('Store', {
  name: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: true },
  address: { type: DataTypes.STRING(500), allowNull: true }
});
const Rating = sequelize.define('Rating', {
  rating: { type: DataTypes.INTEGER, allowNull: false }
});
User.hasMany(Rating, { foreignKey: 'userId' });
Rating.belongsTo(User, { foreignKey: 'userId' });
Store.hasMany(Rating, { foreignKey: 'storeId' });
Rating.belongsTo(Store, { foreignKey: 'storeId' });
User.hasMany(Store, { foreignKey: 'ownerId' });
Store.belongsTo(User, { foreignKey: 'ownerId' });
export { sequelize, User, Store, Rating };
