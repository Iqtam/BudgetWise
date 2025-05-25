const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LogTable = sequelize.define('LogTable', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  level: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['info', 'warning', 'error', 'debug']]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  context: {
    type: DataTypes.JSON
  },
  source: {
    type: DataTypes.STRING(100)
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  user_agent: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'log_table',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = LogTable; 