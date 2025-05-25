const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AIExtraction = sequelize.define('AIExtraction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  upload_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'uploads',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  extracted_data: {
    type: DataTypes.JSON,
    allowNull: false
  },
  confidence_score: {
    type: DataTypes.DECIMAL(5, 2)
  },
  extraction_type: {
    type: DataTypes.STRING(50),
    validate: {
      isIn: [['receipt', 'invoice', 'bank_statement', 'other']]
    }
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'processing', 'completed', 'failed']]
    }
  },
  error_message: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'ai_extractions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AIExtraction; 