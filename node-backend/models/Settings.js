const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // Store settings as JSON for flexibility
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {},
  },
}, {
  tableName: 'settings',
  timestamps: true,
});

module.exports = Settings;

