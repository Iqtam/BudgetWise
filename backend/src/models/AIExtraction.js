const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const AIExtraction = sequelize.define(
  "AIExtraction",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    linked_transaction_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "transaction",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    upload_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "uploads",
        key: "id",
      },
      onDelete: "SET NULL",
    },
    source: {
      type: DataTypes.TEXT,
    },
    interpreted_type: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["income", "expense", "budget", "debt", "saving"]],
      },
    },
    category_suggestion: {
      type: DataTypes.STRING(100),
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
    },
    extraction_method: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [["chat", "ocr"]],
      },
    },
    confidence_score: {
      type: DataTypes.FLOAT,
    },
  },
  {
    tableName: "ai_extractions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = AIExtraction;
