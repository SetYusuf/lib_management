const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Loan = sequelize.define('Loan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  memberId: { type: DataTypes.INTEGER, allowNull: false },
  bookId: { type: DataTypes.INTEGER, allowNull: false },
  loanDate: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  returnDate: { type: DataTypes.DATEONLY, allowNull: true },
  status: { type: DataTypes.ENUM('Borrowed', 'Returned'), allowNull: false, defaultValue: 'Borrowed' },
  renewalCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  fineAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0.00 },
}, {
  tableName: 'loans',
  timestamps: true,
});

module.exports = Loan;
