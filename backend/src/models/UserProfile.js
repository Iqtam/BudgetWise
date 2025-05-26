const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
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
  full_name: {
    type: DataTypes.STRING(100)
  },
  profile_picture_url: {
    type: DataTypes.TEXT
  },
  date_of_birth: {
    type: DataTypes.DATE
  },
  gender: {
    type: DataTypes.STRING(20)
  },
  country: {
    type: DataTypes.STRING(100)
  },
  occupation: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'user_profiles',
  timestamps: false
});

module.exports = UserProfile;
