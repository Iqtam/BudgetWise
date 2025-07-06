const request = require("supertest");
const express = require("express");
const transactionController = require("../controllers/transactionController");

// Mock the Transaction model
jest.mock("../models/Transaction", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
}));

const Transaction = require("../models/Transaction");

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

// Add route for testing
app.post("/transactions", transactionController.createTransaction);
app.get("/transactions", transactionController.getAllTransactions);

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
    });

    it("should handle missing required fields", async () => {
      const incompleteData = {
        amount: -25.0,
        // Missing required fields like user_id, description, etc.
      };

      // Mock Transaction.create to throw an error
      Transaction.create.mockRejectedValue(
        new Error("Missing required fields")
      );

      const response = await request(app)
        .post("/transactions")
        .send(incompleteData)
        .expect(500);

      expect(response.body).toHaveProperty(
        "message",
        "Missing required fields"
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
});
