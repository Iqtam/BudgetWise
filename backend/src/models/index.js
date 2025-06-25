const { sequelize } = require('../config/database');
const User = require('./User');
const UserProfile = require('./UserProfile');
const Category = require('./Category');
const Transaction = require('./Transaction');
const Event = require('./Event');
const Debt = require('./Debt');
const Saving = require('./Saving');
const Budget = require('./Budget');
const Transfer = require('./Transfer');
const RecurrentTransaction = require('./RecurrentTransaction');
const ChatInteraction = require('./ChatInteraction');
const Upload = require('./Upload');
const UserSession = require('./UserSession');
const EmailVerificationToken = require('./EmailVerificationToken');
const PasswordResetToken = require('./PasswordResetToken');
const AIExtraction = require('./AIExtraction');
const LogTable = require('./LogTable');

// User associations
User.hasOne(UserProfile, { foreignKey: 'user_id' });
UserProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Debt, { foreignKey: 'user_id' });
Debt.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Saving, { foreignKey: 'user_id' });
Saving.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Budget, { foreignKey: 'user_id' });
Budget.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Transfer, { foreignKey: 'user_id' });
Transfer.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(RecurrentTransaction, { foreignKey: 'user_id' });
RecurrentTransaction.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(ChatInteraction, { foreignKey: 'user_id' });
ChatInteraction.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Upload, { foreignKey: 'user_id' });
Upload.belongsTo(User, { foreignKey: 'user_id' });

// New associations for authentication and security
User.hasMany(UserSession, { foreignKey: 'user_id' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(EmailVerificationToken, { foreignKey: 'user_id' });
EmailVerificationToken.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(PasswordResetToken, { foreignKey: 'user_id' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id' });

// Category associations
Category.hasMany(Transaction, { foreignKey: 'category_id' });
Transaction.belongsTo(Category, { foreignKey: 'category_id' });

Category.hasOne(Budget, { foreignKey: 'category_id' });
Budget.belongsTo(Category, { foreignKey: 'category_id' });

// Event associations
Event.hasMany(Transaction, { foreignKey: 'event_id' });
Transaction.belongsTo(Event, { foreignKey: 'event_id' });

// Transaction associations
Transaction.hasMany(Transfer, { as: 'IncomeTransfers', foreignKey: 'from_income_id' });
Transaction.hasMany(Transfer, { as: 'ExpenseTransfers', foreignKey: 'to_expense_id' });
Transaction.hasMany(RecurrentTransaction, { foreignKey: 'transaction_id' });
Transaction.hasMany(ChatInteraction, { foreignKey: 'linked_transaction_id' });

// Saving associations
Saving.hasMany(Transfer, { as: 'FromSavingTransfers', foreignKey: 'from_saving_id' });
Saving.hasMany(Transfer, { as: 'ToSavingTransfers', foreignKey: 'to_savings_id' });

// Debt associations
Debt.hasMany(Transfer, { foreignKey: 'to_debt_id' });

// Upload and AI Extraction associations
Upload.hasOne(AIExtraction, { foreignKey: 'upload_id' });
AIExtraction.belongsTo(Upload, { foreignKey: 'upload_id' });

// Log associations
User.hasMany(LogTable, { foreignKey: 'user_id' });
LogTable.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  UserProfile,
  Category,
  Transaction,
  Event,
  Debt,
  Saving,
  Budget,
  Transfer,
  RecurrentTransaction,
  ChatInteraction,
  Upload,
  UserSession,
  EmailVerificationToken,
  PasswordResetToken,
  AIExtraction,
  LogTable
}; 