const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transfer = sequelize.define('Transfer', {
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
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  from_income_id: {
    type: DataTypes.UUID,
    references: {
      model: 'transaction',
      key: 'id'
    }
  },
  from_saving_id: {
    type: DataTypes.UUID,
    references: {
      model: 'saving',
      key: 'id'
    }
  },
  to_debt_id: {
    type: DataTypes.UUID,
    references: {
      model: 'debt',
      key: 'id'
    }
  },
  to_savings_id: {
    type: DataTypes.UUID,
    references: {
      model: 'saving',
      key: 'id'
    }
  },
  to_expense_id: {
    type: DataTypes.UUID,
    references: {
      model: 'transaction',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'transfer',
  timestamps: false
});

module.exports = Transfer; 