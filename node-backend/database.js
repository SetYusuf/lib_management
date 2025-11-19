// database.js

require('dotenv').config();
const { Sequelize } = require('sequelize');

const DB_CONNECTION = process.env.DB_CONNECTION || 'pgsql';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_DATABASE = process.env.DB_DATABASE || 'librymnm';
const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '@Yusuf1234';

if (DB_CONNECTION !== 'pgsql') {
  console.warn(`Warning: DB_CONNECTION is set to "${DB_CONNECTION}". This backend is configured for PostgreSQL (pgsql).`);
}

const sequelize = new Sequelize(DB_DATABASE, DB_USERNAME, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connection established');
    // Use alter: true to add missing columns to existing tables
    // Set DB_ALTER=false in production to disable automatic schema changes
    const shouldAlter = process.env.DB_ALTER !== 'false';
    await sequelize.sync({ alter: shouldAlter });
    console.log('Database synchronized');
  } catch (error) {
    console.error('PostgreSQL connection error:', error.message);
    console.error(`Tried postgres://${DB_USERNAME}:***@${DB_HOST}:${DB_PORT}/${DB_DATABASE}`);
    console.error('\nIf you see column errors, you may need to run the migration script:');
    console.error('See node-backend/migrations/add_circulation_columns.sql');
  }
};

module.exports = { sequelize, connectDB };
