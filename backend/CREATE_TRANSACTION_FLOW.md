# 🔄 Create Transaction Functionality Flow

## 📋 Overview

This document provides a comprehensive explanation of how the **Create Transaction** functionality works in the BudgetWise backend, including the complete request-response flow, database operations, and business logic.

## 🌊 Complete Request Flow

```
Frontend Request → Express App → Authentication → Route Resolution → Controller → Database → Business Logic → Response
```

## 📁 Files Involved

### **Core Files**
- `src/app.js` - Main Express application entry point
- `src/routes/transactionRoutes.js` - Transaction route definitions
- `src/middlewares/firebaseAuth.js` - Authentication middleware
- `src/controllers/transactionController.js` - Transaction business logic
- `src/models/Transaction.js` - Transaction database model
- `src/models/index.js` - Model associations and relationships
- `src/config/database.js` - Database connection configuration

### **Supporting Files**
- `src/controllers/budgetController.js` - Budget synchronization logic
- `src/models/Budget.js` - Budget database model
- `src/models/User.js` - User database model
- `src/models/Category.js` - Category database model
- `src/config/firebase-admin.js` - Firebase Admin SDK configuration

## 🚀 Step-by-Step Flow

### **1. Application Initialization**

**File**: `src/app.js`
```javascript
// Load environment variables
require("dotenv").config();

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Setup middleware
app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/transactions", transactionRoutes);
```

**What happens**:
- Environment variables loaded from `.env` file
- Database connection established via Sequelize
- CORS enabled for cross-origin requests
- JSON body parser middleware enabled
- Transaction routes registered under `/api/transactions`

### **2. Frontend Request**

**Example HTTP Request**:
```http
POST http://localhost:5000/api/transactions
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "user_id": "user-uuid-123",
  "amount": -50.00,
  "description": "Grocery shopping",
  "type": "expense",
  "category_id": "food-category-uuid",
  "date": "2025-07-16"
}
```

### **3. Route Resolution**

**File**: `src/routes/transactionRoutes.js`
```javascript
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const verifyFirebaseToken = require('../middlewares/firebaseAuth');

// Apply authentication to all routes
router.use(verifyFirebaseToken);

// POST /api/transactions
router.post('/', transactionController.createTransaction);
```

**What happens**:
- Request matches POST `/api/transactions`
- Authentication middleware applied first
- Routes to `createTransaction` controller method

### **4. Authentication Middleware**

**File**: `src/middlewares/firebaseAuth.js`
```javascript
module.exports = async function verifyFirebaseToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // Adds user info to request
    next(); // Continue to controller
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**What happens**:
- Extracts Bearer token from Authorization header
- Verifies token with Firebase Admin SDK
- Adds decoded user info to `req.user`
- Continues to controller if valid, returns 401 if invalid

### **5. Controller Processing**

**File**: `src/controllers/transactionController.js`
```javascript
exports.createTransaction = async (req, res) => {
  try {
    // Extract request data
    const {
      user_id, amount, date, description, 
      category_id, type, event_id, recurrence, confirmed
    } = req.body;

    // Create transaction in database
    const transaction = await Transaction.create({
      user_id,
      amount,
      date: date || new Date(),
      description,
      category_id,
      type,
      event_id,
      recurrence: recurrence || false,
      confirmed: confirmed !== undefined ? confirmed : true
    });

    // Sync budget spending for expenses
    if (type === 'expense' && category_id) {
      try {
        await syncBudgetSpending(user_id, category_id);
      } catch (budgetError) {
        console.error('Error syncing budget spending:', budgetError);
        // Don't fail transaction if budget sync fails
      }
    }

    // Return success response
    res.status(201).json({
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({ message: error.message });
  }
};
```

**What happens**:
- Extracts transaction data from request body
- Creates transaction record in database using Sequelize
- Triggers budget synchronization for expense transactions
- Returns standardized JSON response

### **6. Database Operations**

**File**: `src/models/Transaction.js`
```javascript
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  // ... other fields
}, {
  tableName: 'transaction',
  timestamps: false
});
```

**Generated SQL Query**:
```sql
INSERT INTO transaction (
  id, user_id, amount, date, description, category_id, type, event_id, recurrence, confirmed
) VALUES (
  'generated-uuid-456', 
  'user-uuid-123', 
  -50.00, 
  '2025-07-16', 
  'Grocery shopping', 
  'food-category-uuid', 
  'expense', 
  NULL, 
  false, 
  true
) RETURNING *;
```

### **7. Business Logic: Budget Synchronization**

**File**: `src/controllers/budgetController.js`
```javascript
exports.syncBudgetSpending = async (userId, categoryId = null) => {
  try {
    // Find budgets to sync
    const budgetQuery = { user_id: userId };
    if (categoryId) budgetQuery.category_id = categoryId;
    
    const budgets = await Budget.findAll({ where: budgetQuery });

    for (const budget of budgets) {
      if (!budget.category_id) continue;

      // Calculate total spent for this budget's category
      const totalSpent = await Transaction.sum('amount', {
        where: {
          user_id: userId,
          category_id: budget.category_id,
          type: 'expense',
          date: {
            [Op.between]: [budget.start_date, budget.end_date]
          }
        }
      });

      // Update budget with new spent amount
      const spentAmount = totalSpent ? Math.abs(totalSpent) : 0;
      await budget.update({ 
        spent: spentAmount,
        amount_exceeded: spentAmount > budget.goal_amount
      });
    }
  } catch (error) {
    console.error('Error syncing budget spending:', error);
    throw error;
  }
};
```

**Generated SQL Queries**:
```sql
-- Find budgets for user and category
SELECT * FROM budget 
WHERE user_id = 'user-uuid-123' AND category_id = 'food-category-uuid';

-- Calculate total spending
SELECT SUM(amount) FROM transaction 
WHERE user_id = 'user-uuid-123' 
  AND category_id = 'food-category-uuid' 
  AND type = 'expense' 
  AND date BETWEEN '2025-01-01' AND '2025-12-31';

-- Update budget
UPDATE budget 
SET spent = 150.00, amount_exceeded = false 
WHERE id = 'budget-uuid-789';
```

### **8. Response Generation**

**HTTP Response**:
```http
HTTP/1.1 201 Created
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "message": "Transaction created successfully",
  "data": {
    "id": "generated-uuid-456",
    "user_id": "user-uuid-123",
    "amount": -50.00,
    "date": "2025-07-16",
    "description": "Grocery shopping",
    "category_id": "food-category-uuid",
    "type": "expense",
    "event_id": null,
    "recurrence": false,
    "confirmed": true
  }
}
```

## 🔗 Database Relationships

**File**: `src/models/index.js`

### **User Relationships**
```javascript
User.hasMany(Transaction, { foreignKey: 'user_id' });
Transaction.belongsTo(User, { foreignKey: 'user_id' });
```

### **Category Relationships**
```javascript
Category.hasMany(Transaction, { foreignKey: 'category_id' });
Transaction.belongsTo(Category, { foreignKey: 'category_id' });

Category.hasOne(Budget, { foreignKey: 'category_id' });
Budget.belongsTo(Category, { foreignKey: 'category_id' });
```

### **Budget Relationships**
```javascript
User.hasMany(Budget, { foreignKey: 'user_id' });
Budget.belongsTo(User, { foreignKey: 'user_id' });
```

## 🛡️ Security Features

### **Authentication**
- Firebase ID token verification
- User context attached to requests
- Protected routes via middleware

### **Data Validation**
- Sequelize model validation
- Required field validation
- Data type validation
- Foreign key constraints

### **Error Handling**
- Try-catch blocks in controllers
- Global error middleware in `src/app.js`
- Graceful degradation for non-critical failures

## 🗄️ Database Configuration

**File**: `src/config/database.js`

### **Connection Settings**
```javascript
const sequelize = new Sequelize(
  process.env.POSTGRES_DB,      // "budgetwise"
  process.env.POSTGRES_USER,    // "postgres"
  process.env.POSTGRES_PASSWORD,// "postgres"
  {
    host: process.env.POSTGRES_HOST, // "localhost"
    dialect: 'postgres',
    pool: {
      max: 5,          // Maximum connections
      min: 0,          // Minimum connections
      acquire: 30000,  // Connection timeout
      idle: 10000      // Idle timeout
    }
  }
);
```

### **Model Synchronization**
```javascript
await sequelize.sync({ alter: true });
```

## 🚨 Error Scenarios

### **Authentication Errors**
```javascript
// Missing token
{ "error": "Missing token" }

// Invalid token  
{ "error": "Invalid token" }
```

### **Validation Errors**
```javascript
// Sequelize validation error
{ "message": "amount cannot be null" }

// Unique constraint error
{ "message": "This value already exists" }
```

### **Database Errors**
```javascript
// Connection error
{ "message": "Unable to connect to database" }

// General error
{ "message": "Something went wrong!" }
```

## 🔄 Complete Flow Summary

1. **Request Initiation**: Frontend sends POST request with transaction data and Firebase token
2. **Route Matching**: Express matches request to transaction route
3. **Authentication**: Firebase middleware verifies token and adds user context
4. **Controller Logic**: Transaction controller processes business logic
5. **Database Operation**: Sequelize creates transaction record in PostgreSQL
6. **Budget Sync**: Automatic budget spending calculation and update
7. **Response**: Standardized JSON response sent back to frontend
8. **Error Handling**: Global error middleware catches and formats any errors

## 📊 Performance Considerations

### **Database Optimizations**
- Connection pooling (max 5 connections)
- Prepared statements via Sequelize
- Indexed foreign key columns
- Efficient batch operations for budget sync

### **Error Recovery**
- Retry logic for database connections
- Graceful degradation for budget sync failures
- Transaction isolation for data consistency

## 🔧 Configuration Files

### **Environment Variables** (`.env`)
```properties
POSTGRES_DB=budgetwise
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
```

### **Package Dependencies** (`package.json`)
```json
{
  "sequelize": "^6.37.7",
  "pg": "^8.16.0",
  "express": "^5.1.0",
  "firebase-admin": "^13.4.0",
  "cors": "^2.8.5"
}
```

This flow ensures secure, efficient, and reliable transaction creation with proper authentication, validation, database operations, and business logic integration.