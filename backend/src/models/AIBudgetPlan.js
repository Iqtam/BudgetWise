const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIBudgetPlan = sequelize.define('AIBudgetPlan', {
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
  framework_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  monthly_income: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  category_allocations: {
    type: DataTypes.JSONB
  },
  total_needs: {
    type: DataTypes.DECIMAL(12, 2)
  },
  total_wants: {
    type: DataTypes.DECIMAL(12, 2)
  },
  total_savings_debt: {
    type: DataTypes.DECIMAL(12, 2)
  },
  confidence_score: {
    type: DataTypes.DECIMAL(3, 2)
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'archived', 'rejected']]
    }
  },
  user_feedback: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'ai_budget_plans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AIBudgetPlan; 