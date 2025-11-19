const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Fine = sequelize.define('Fine', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  memberId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  loanId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Overdue',
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Waived'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  paidDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  daysOverdue: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
}, {
  tableName: 'fines',
  timestamps: true,
});

module.exports = Fine;

