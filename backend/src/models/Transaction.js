const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  description: {
    type: DataTypes.TEXT
  },
  category_id: {
    type: DataTypes.UUID,
    references: {
      model: 'category',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  type: {
    type: DataTypes.STRING(50),
    validate: {
      isIn: [['income', 'expense']]
    }
  },
  event_id: {
    type: DataTypes.UUID,
    references: {
      model: 'event',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  recurrence: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'transaction',
  timestamps: false
});

module.exports = Transaction; 