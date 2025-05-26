const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING, // Firebase UID
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'admin']]
    }
  },
  last_login: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'inactive', 'suspended']]
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const UserProfile = require('./UserProfile');
User.hasOne(UserProfile, { foreignKey: 'user_id' });
UserProfile.belongsTo(User, { foreignKey: 'user_id' });


module.exports = User;
