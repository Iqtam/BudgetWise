const request = require("supertest");
const express = require("express");
const transactionController = require("../controllers/transactionController");
const { Op } = require('sequelize');

// Mock the Transaction model
jest.mock("../models/Transaction", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  destroy: jest.fn(),
}));

// Mock the budget controller
jest.mock("../controllers/budgetController", () => ({
  syncBudgetSpending: jest.fn(),
}));

const Transaction = require("../models/Transaction");
const { syncBudgetSpending } = require("../controllers/budgetController");

// Suppress console.error during tests to reduce noise
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Create a test Express app
const app = express();
app.use(express.json());

// Add routes for testing
app.post("/transactions", transactionController.createTransaction);
app.get("/transactions", transactionController.getAllTransactions);
app.get("/transactions/:id", transactionController.getTransactionById);
app.delete("/transactions/:id", transactionController.deleteTransaction);
app.put("/transactions/:id", transactionController.updateTransaction);

describe("Transaction Controller", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("POST /transactions", () => {
    it("should create a new transaction successfully", async () => {
      // Mock data
      const mockTransactionData = {
        user_id: "test-user-123",
        amount: -50.0,
        date: "2024-11-05",
        description: "Grocery shopping",
        category_id: "category-123",
        type: "expense",
        event_id: null,
        recurrence: false,
        confirmed: true,
      };

      const mockCreatedTransaction = {
        id: "transaction-123",
        ...mockTransactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock the Transaction.create method
      Transaction.create.mockResolvedValue(mockCreatedTransaction);
      syncBudgetSpending.mockResolvedValue();

      // Make the request
      const response = await request(app)
        .post("/transactions")
        .send(mockTransactionData)
        .expect(201);

      // Assertions
      expect(response.body).toHaveProperty(
        "message",
        "Transaction created successfully"
      );
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id", "transaction-123");
      expect(response.body.data).toHaveProperty("amount", -50.0);
      expect(response.body.data).toHaveProperty(
        "description",
        "Grocery shopping"
      );
      expect(response.body.data).toHaveProperty("type", "expense");

      // Verify that Transaction.create was called with correct data
      expect(Transaction.create).toHaveBeenCalledTimes(1);
      expect(Transaction.create).toHaveBeenCalledWith({
        user_id: "test-user-123",
        amount: -50.0,
        date: "2024-11-05",
        description: "Grocery shopping",
        category_id: "category-123",
        type: "expense",
        event_id: null,
        recurrence: false,
        confirmed: true,
      });

      // Verify budget sync was called for expense with category
      expect(syncBudgetSpending).toHaveBeenCalledWith("test-user-123", "category-123");
    });

    it("should create income transaction without budget sync", async () => {
      const mockTransactionData = {
        user_id: "test-user-123",
        amount: 1000.0,
        date: "2024-11-05",
        description: "Salary",
        category_id: "category-456",
        type: "income",
        event_id: null,
        recurrence: false,
        confirmed: true,
      };

      const mockCreatedTransaction = {
        id: "transaction-456",
        ...mockTransactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Transaction.create.mockResolvedValue(mockCreatedTransaction);

      const response = await request(app)
        .post("/transactions")
        .send(mockTransactionData)
        .expect(201);

      expect(response.body.data).toHaveProperty("type", "income");
      
      // Budget sync should not be called for income transactions
      expect(syncBudgetSpending).not.toHaveBeenCalled();
    });

    it("should create expense without category and skip budget sync", async () => {
      const mockTransactionData = {
        user_id: "test-user-123",
        amount: -25.0,
        date: "2024-11-05",
        description: "Cash withdrawal",
        type: "expense",
        event_id: null,
        recurrence: false,
        confirmed: true,
      };

      const mockCreatedTransaction = {
        id: "transaction-789",
        ...mockTransactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Transaction.create.mockResolvedValue(mockCreatedTransaction);

      const response = await request(app)
        .post("/transactions")
        .send(mockTransactionData)
        .expect(201);

      expect(response.body.data).toHaveProperty("type", "expense");
      
      // Budget sync should not be called for expenses without category
      expect(syncBudgetSpending).not.toHaveBeenCalled();
    });

    it("should handle missing required fields", async () => {
      const incompleteData = {
        amount: -25.0,
        // Missing required fields like user_id, description, etc.
      };

      // Mock Transaction.create to throw an error
      Transaction.create.mockRejectedValue(
        new Error("user_id cannot be null")
      );

      const response = await request(app)
        .post("/transactions")
        .send(incompleteData)
        .expect(500);

      expect(response.body).toHaveProperty(
        "message",
        "user_id cannot be null"
      );
    });

    it("should set default values for optional fields", async () => {
      const minimalData = {
        user_id: "test-user-456",
        amount: 100.0,
        description: "Salary",
        type: "income",
      };

      const mockCreatedTransaction = {
        id: "transaction-456",
        ...minimalData,
        date: expect.any(Date),
        recurrence: false,
        confirmed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Transaction.create.mockResolvedValue(mockCreatedTransaction);

      const response = await request(app)
        .post("/transactions")
        .send(minimalData)
        .expect(201);

      expect(response.body.data).toHaveProperty("id", "transaction-456");

      // Verify that default values were set
      expect(Transaction.create).toHaveBeenCalledWith({
        user_id: "test-user-456",
        amount: 100.0,
        date: expect.any(Date), // Should use current date
        description: "Salary",
        category_id: undefined,
        type: "income",
        event_id: undefined,
        recurrence: false,
        confirmed: true,
      });
    });

    it("should handle database creation errors", async () => {
      const mockTransactionData = {
        user_id: "test-user-123",
        amount: -50.0,
        description: "Grocery shopping",
        type: "expense",
      };

      Transaction.create.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app)
        .post("/transactions")
        .send(mockTransactionData)
        .expect(500);

      expect(response.body).toHaveProperty(
        "message",
        "Database connection failed"
      );
    });

    it("should handle budget sync errors gracefully", async () => {
      const mockTransactionData = {
        user_id: "test-user-123",
        amount: -50.0,
        description: "Grocery shopping",
        category_id: "category-123",
        type: "expense",
      };

      const mockCreatedTransaction = {
        id: "transaction-123",
        ...mockTransactionData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Transaction.create.mockResolvedValue(mockCreatedTransaction);
      syncBudgetSpending.mockRejectedValue(new Error("Budget sync failed"));

      const response = await request(app)
        .post("/transactions")
        .send(mockTransactionData)
        .expect(201);

      // Transaction should still be created even if budget sync fails
      expect(response.body).toHaveProperty(
        "message",
        "Transaction created successfully"
      );
      expect(syncBudgetSpending).toHaveBeenCalled();
    });
  });

  describe("GET /transactions", () => {
    it("should fetch transactions for a specific user", async () => {
      const mockTransactions = [
        {
          id: "transaction-1",
          user_id: "test-user-123",
          amount: -30.0,
          description: "Coffee",
          type: "expense",
        },
        {
          id: "transaction-2",
          user_id: "test-user-123",
          amount: 1000.0,
          description: "Salary",
          type: "income",
        },
      ];

      Transaction.findAll.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get("/transactions?user_id=test-user-123")
        .expect(200);

      expect(response.body).toEqual(mockTransactions);
      expect(Transaction.findAll).toHaveBeenCalledWith({
        where: { user_id: "test-user-123" },
        order: [["date", "DESC"]],
      });
    });

    it("should fetch all transactions when no user_id provided", async () => {
      const mockTransactions = [
        {
          id: "transaction-1",
          user_id: "test-user-123",
          amount: -30.0,
          description: "Coffee",
          type: "expense",
        },
        {
          id: "transaction-2",
          user_id: "test-user-456",
          amount: 1000.0,
          description: "Salary",
          type: "income",
        },
      ];

      Transaction.findAll.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get("/transactions")
        .expect(200);

      expect(response.body).toEqual(mockTransactions);
      expect(Transaction.findAll).toHaveBeenCalledWith({
        where: {},
        order: [["date", "DESC"]],
      });
    });

    it("should filter transactions by type", async () => {
      const mockTransactions = [
        {
          id: "transaction-1",
          user_id: "test-user-123",
          amount: -30.0,
          description: "Coffee",
          type: "expense",
        },
      ];

      Transaction.findAll.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get("/transactions?type=expense")
        .expect(200);

      expect(Transaction.findAll).toHaveBeenCalledWith({
        where: { type: "expense" },
        order: [["date", "DESC"]],
      });
    });

    it("should filter transactions by category", async () => {
      const mockTransactions = [
        {
          id: "transaction-1",
          user_id: "test-user-123",
          amount: -30.0,
          description: "Coffee",
          type: "expense",
          category_id: "category-123",
        },
      ];

      Transaction.findAll.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get("/transactions?category_id=category-123")
        .expect(200);

      expect(Transaction.findAll).toHaveBeenCalledWith({
        where: { category_id: "category-123" },
        order: [["date", "DESC"]],
      });
    });

    it("should search transactions by description", async () => {
      const mockTransactions = [
        {
          id: "transaction-1",
          user_id: "test-user-123",
          amount: -30.0,
          description: "Coffee at Starbucks",
          type: "expense",
        },
      ];

      Transaction.findAll.mockResolvedValue(mockTransactions);

      const response = await request(app)
        .get("/transactions?search=coffee")
        .expect(200);

      expect(Transaction.findAll).toHaveBeenCalledWith({
        where: { description: { [Op.iLike]: "%coffee%" } },
        order: [["date", "DESC"]],
      });
    });

    it("should handle database errors gracefully", async () => {
      Transaction.findAll.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app)
        .get("/transactions?user_id=test-user-123")
        .expect(500);

      expect(response.body).toHaveProperty(
        "message",
        "Database connection failed"
      );
    });
  });

  describe("GET /transactions/:id", () => {
    it("should fetch a specific transaction by ID", async () => {
      const mockTransaction = {
        id: "transaction-123",
        user_id: "test-user-123",
        amount: -50.0,
        description: "Grocery shopping",
        type: "expense",
        category_id: "category-123",
        date: "2024-11-05",
        createdAt: "2025-07-08T13:26:12.501Z",
        updatedAt: "2025-07-08T13:26:12.501Z",
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .get("/transactions/transaction-123")
        .expect(200);

      expect(response.body).toEqual(mockTransaction);
      expect(Transaction.findByPk).toHaveBeenCalledWith("transaction-123");
    });

    it("should return 404 for non-existent transaction", async () => {
      Transaction.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get("/transactions/non-existent-id")
        .expect(404);

      expect(response.body).toHaveProperty(
        "message",
        "Transaction not found"
      );
    });

    it("should handle database errors", async () => {
      Transaction.findByPk.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await request(app)
        .get("/transactions/transaction-123")
        .expect(500);

      expect(response.body).toHaveProperty(
        "message",
        "Database connection failed"
      );
    });
  });

  describe("DELETE /transactions/:id", () => {
    it("should delete a transaction successfully", async () => {
      const mockTransaction = {
        id: "transaction-123",
        user_id: "test-user-123",
        amount: -50.0,
        description: "Grocery shopping",
        type: "expense",
        category_id: "category-123",
        destroy: jest.fn().mockResolvedValue(),
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);
      syncBudgetSpending.mockResolvedValue();

      const response = await request(app)
        .delete("/transactions/transaction-123")
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Transaction deleted successfully"
      );
      expect(mockTransaction.destroy).toHaveBeenCalled();
      expect(syncBudgetSpending).toHaveBeenCalledWith("test-user-123", "category-123");
    });

    it("should return 404 for non-existent transaction", async () => {
      Transaction.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .delete("/transactions/non-existent-id")
        .expect(404);

      expect(response.body).toHaveProperty(
        "message",
        "Transaction not found"
      );
    });

    it("should handle deletion errors", async () => {
      const mockTransaction = {
        id: "transaction-123",
        user_id: "test-user-123",
        amount: -50.0,
        description: "Grocery shopping",
        type: "expense",
        category_id: "category-123",
        destroy: jest.fn().mockRejectedValue(new Error("Deletion failed")),
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .delete("/transactions/transaction-123")
        .expect(500);

      expect(response.body).toHaveProperty(
        "message",
        "Deletion failed"
      );
    });

    it("should handle budget sync errors gracefully during deletion", async () => {
      const mockTransaction = {
        id: "transaction-123",
        user_id: "test-user-123",
        amount: -50.0,
        description: "Grocery shopping",
        type: "expense",
        category_id: "category-123",
        destroy: jest.fn().mockResolvedValue(),
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);
      syncBudgetSpending.mockRejectedValue(new Error("Budget sync failed"));

      const response = await request(app)
        .delete("/transactions/transaction-123")
        .expect(200);

      // Transaction should still be deleted even if budget sync fails
      expect(response.body).toHaveProperty(
        "message",
        "Transaction deleted successfully"
      );
      expect(mockTransaction.destroy).toHaveBeenCalled();
    });
  });

  describe("PUT /transactions/:id", () => {
    it("should update a transaction successfully", async () => {
      const mockTransaction = {
        id: "transaction-123",
        user_id: "test-user-123",
        amount: -50.0,
        description: "Grocery shopping",
        type: "expense",
        category_id: "category-123",
        date: "2024-11-05",
        recurrence: false,
        confirmed: true,
        update: jest.fn().mockResolvedValue(),
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);
      syncBudgetSpending.mockResolvedValue();

      const updateData = {
        amount: -75.0,
        description: "Updated grocery shopping",
      };

      const response = await request(app)
        .put("/transactions/transaction-123")
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty(
        "message",
        "Transaction updated successfully"
      );
      expect(mockTransaction.update).toHaveBeenCalledWith({
        amount: -75.0,
        description: "Updated grocery shopping",
        date: "2024-11-05",
        category_id: "category-123",
        type: "expense",
        event_id: undefined,
        recurrence: false,
        confirmed: true,
      });
    });

    it("should return 404 for non-existent transaction", async () => {
      Transaction.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .put("/transactions/non-existent-id")
        .send({ amount: 100.0 })
        .expect(404);

      expect(response.body).toHaveProperty(
        "message",
        "Transaction not found"
      );
    });

    it("should handle update errors", async () => {
      const mockTransaction = {
        id: "transaction-123",
        user_id: "test-user-123",
        amount: -50.0,
        description: "Grocery shopping",
        type: "expense",
        category_id: "category-123",
        update: jest.fn().mockRejectedValue(new Error("Update failed")),
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .put("/transactions/transaction-123")
        .send({ amount: 100.0 })
        .expect(500);

      expect(response.body).toHaveProperty(
        "message",
        "Update failed"
      );
    });

    it("should handle partial updates correctly", async () => {
      const mockTransaction = {
        id: "transaction-123",
        user_id: "test-user-123",
        amount: -50.0,
        description: "Grocery shopping",
        type: "expense",
        category_id: "category-123",
        date: "2024-11-05",
        recurrence: false,
        confirmed: true,
        update: jest.fn().mockResolvedValue(),
      };

      Transaction.findByPk.mockResolvedValue(mockTransaction);

      const response = await request(app)
        .put("/transactions/transaction-123")
        .send({ amount: -75.0 })
        .expect(200);

      expect(mockTransaction.update).toHaveBeenCalledWith({
        amount: -75.0,
        date: "2024-11-05",
        description: "Grocery shopping",
        category_id: "category-123",
        type: "expense",
        event_id: undefined,
        recurrence: false,
        confirmed: true,
      });
    });
  });
});
