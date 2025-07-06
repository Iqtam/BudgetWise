const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  icon_url: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  parent_id: {
    type: DataTypes.UUID,
    references: {
      model: 'category',
      key: 'id'
    }
  }
}, {
  tableName: 'category',
  timestamps: false
});

// Self-referential relationship
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });
Category.hasMany(Category, { as: 'children', foreignKey: 'parent_id' });

module.exports = Category; 