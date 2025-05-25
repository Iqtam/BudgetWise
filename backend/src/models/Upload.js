const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Upload = sequelize.define('Upload', {
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
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(50)
  },
  storage_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  parsed_text: {
    type: DataTypes.TEXT
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'uploads',
  timestamps: false
});

module.exports = Upload; 