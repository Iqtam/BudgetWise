// src/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const debtRoutes = require("./routes/debtRoutes");
const savingRoutes = require("./routes/savingRoutes");
const balanceRoutes = require("./routes/balanceRoutes");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const ocrRoutes = require("./routes/ocrRoutes");
const aiAssistantRoutes = require("./routes/aiAssistantRoutes");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/debts", debtRoutes);
app.use("/api/savings", savingRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/assistant", aiAssistantRoutes);

// Basic route
app.get("/api/health", (req, res) => {
  res.json({ message: "Welcome to BudgetWise API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({ message: err.errors[0].message });
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({ message: "This value already exists" });
  }
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
