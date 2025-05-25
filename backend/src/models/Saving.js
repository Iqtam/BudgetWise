const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Saving = sequelize.define('Saving', {
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
  description: {
    type: DataTypes.TEXT
  },
  start_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  target_amount: {
    type: DataTypes.DECIMAL(12, 2)
  },
  start_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  end_date: {
    type: DataTypes.DATEONLY
  },
  expired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'saving',
  timestamps: false
});

module.exports = Saving; 