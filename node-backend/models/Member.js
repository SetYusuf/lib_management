const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  membershipId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Suspended'),
    allowNull: false,
    defaultValue: 'Active',
  },
  joinedDate: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  fineBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  maxBooksLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },
}, {
  tableName: 'members',
  timestamps: true,
});

module.exports = Member;
