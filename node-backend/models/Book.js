// models/Book.js

const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isbn: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  genre: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('Available', 'Loaned', 'Reserved', 'Lost', 'Damaged'),
    allowNull: false,
    defaultValue: 'Available',
  },
  publicationDate: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '',
  },
}, {
  tableName: 'books',
  timestamps: true,
});

module.exports = Book;
