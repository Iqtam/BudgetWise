const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Budget = sequelize.define('Budget', {
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
  category_id: {
    type: DataTypes.UUID,
    unique: true,
    references: {
      model: 'category',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  start_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  goal_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  expired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  amount_exceeded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  icon_url: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'budget',
  timestamps: false
});

module.exports = Budget; 