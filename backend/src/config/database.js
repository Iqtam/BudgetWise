const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB ,
  process.env.POSTGRES_USER ,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST , // Default to the service name in docker-compose
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 5, // Maximum number of connection retries
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      backoffBase: 1000, // Initial delay between retries (ms)
      backoffExponent: 1.5, // Exponential factor
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Database connected successfully');
    
    // Sync all models
    await sequelize.sync();
    console.log('Database synchronized');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB }; 