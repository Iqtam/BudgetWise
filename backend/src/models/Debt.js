const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Debt = sequelize.define('Debt', {
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
  type: {
    type: DataTypes.STRING(50),
    validate: {
      isIn: [['bank', 'personal']]
    }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  expiration_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  original_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  taken_from: {
    type: DataTypes.STRING(50)
  },
  is_fully_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fully_paid_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  last_payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'debt',
  timestamps: false
});

module.exports = Debt; 