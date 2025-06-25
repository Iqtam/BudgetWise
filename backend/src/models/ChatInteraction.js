const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatInteraction = sequelize.define('ChatInteraction', {
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
  input_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  interpreted_action: {
    type: DataTypes.TEXT
  },
  response: {
    type: DataTypes.TEXT
  },
  response_type: {
    type: DataTypes.STRING(30),
    validate: {
      isIn: [['transaction', 'trend', 'forecast', 'suggestion', 'summary']]
    }
  },
  linked_transaction_id: {
    type: DataTypes.UUID,
    references: {
      model: 'transaction',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'chat_interactions',
  timestamps: false
});

module.exports = ChatInteraction; 