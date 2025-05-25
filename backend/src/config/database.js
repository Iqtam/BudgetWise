const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'postgres',
  process.env.POSTGRES_USER || 'postgres',
  process.env.POSTGRES_PASSWORD || '@tin',
  {
    host: process.env.POSTGRES_HOST || 'localhost', // Default to the service name in docker-compose
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

// const connectDB = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log('PostgreSQL Database connected successfully');
    
//     // Sync all models
//     await sequelize.sync();
//     console.log('Database synchronized');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error);
//     process.exit(1);
//   }
// };

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Database connected successfully');

    await sequelize.sync();
    console.log('✅ Database synchronized');

    // Enable extension if not enabled already (needed for gen_random_uuid)
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // Insert a test user
    const insertQuery = `
      INSERT INTO users (email, password_hash)
      VALUES ('testuser@example.com', 'hashed_password_123')
      ON CONFLICT (email) DO NOTHING;
    `;
    await sequelize.query(insertQuery);
    console.log('✅ Test user inserted (or already exists)');

    // Query inserted data
    const [results] = await sequelize.query(`SELECT id, email, role FROM users WHERE email = 'testuser@example.com';`);
    console.log('📦 Retrieved User:', results[0]);

  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB }; 