const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserBudgetPreferences = sequelize.define('UserBudgetPreferences', {
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
  preferred_framework: {
    type: DataTypes.STRING(50)
  },
  spending_priorities: {
    type: DataTypes.JSONB
  },
  savings_preference: {
    type: DataTypes.DECIMAL(3, 2)
  },
  risk_tolerance: {
    type: DataTypes.STRING(20),
    validate: {
      isIn: [['conservative', 'moderate', 'aggressive']]
    }
  },
  financial_goals: {
    type: DataTypes.JSONB
  },
  learning_data: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'user_budget_preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserBudgetPreferences; 