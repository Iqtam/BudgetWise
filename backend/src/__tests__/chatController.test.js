const request = require("supertest");
const express = require("express");
const ocrController = require("../controllers/ocrController");

// Mock dependencies
jest.mock("../models/User", () => ({
  findOne: jest.fn(),
}));

jest.mock("../models/AIExtraction", () => ({
  create: jest.fn(),
}));

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
}));

const User = require("../models/User");
const AIExtraction = require("../models/AIExtraction");

// Create test app
const app = express();
app.use(express.json());

// Mock Firebase auth middleware
const mockFirebaseAuth = (req, res, next) => {
  req.user = { uid: "test-firebase-uid" };
  next();
};

app.post("/chat", mockFirebaseAuth, ocrController.processChatTransaction);

describe("Chat-based Transaction Processing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /chat", () => {
    it("should process chat message successfully", async () => {
      // Mock user lookup
      User.findOne.mockResolvedValue({
        id: "test-user-id",
        firebase_uid: "test-firebase-uid",
      });

      // Mock AI extraction creation
      AIExtraction.create.mockResolvedValue({
        id: "test-extraction-id",
        user_id: "test-user-id",
        source: 'Chat: "I spent $25 at Starbucks yesterday for coffee"',
      });

      // Mock Gemini API response
      const mockGeminiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              type: "expense",
              amount: 25.0,
              date: "2024-01-01T12:00:00",
              vendor: "Starbucks",
              description: "coffee",
              category: "Food",
            }),
        },
      };

      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const mockGenAI = new GoogleGenerativeAI();
      mockGenAI
        .getGenerativeModel()
        .generateContent.mockResolvedValue(mockGeminiResponse);

      const response = await request(app)
        .post("/chat")
        .send({
          message: "I spent $25 at Starbucks yesterday for coffee",
        })
        .expect(200);

      expect(response.body.message).toBe("Transaction processed successfully");
      expect(response.body.data).toMatchObject({
        type: "expense",
        amount: 25.0,
        vendor: "Starbucks",
        description: "coffee",
        category: "Food",
      });

      expect(AIExtraction.create).toHaveBeenCalledWith({
        user_id: "test-user-id",
        upload_id: null,
        source: 'Chat: "I spent $25 at Starbucks yesterday for coffee"',
        interpreted_type: "expense",
        category_suggestion: "Food",
        amount: 25.0,
        extraction_method: "chat",
        confidence_score: 0.8,
      });
    });

    it("should handle income transactions", async () => {
      // Mock user lookup
      User.findOne.mockResolvedValue({
        id: "test-user-id",
        firebase_uid: "test-firebase-uid",
      });

      // Mock AI extraction creation
      AIExtraction.create.mockResolvedValue({
        id: "test-extraction-id",
        user_id: "test-user-id",
        source: 'Chat: "I received $1000 salary from company today"',
      });

      // Mock Gemini API response for income
      const mockGeminiResponse = {
        response: {
          text: () =>
            JSON.stringify({
              type: "income",
              amount: 1000.0,
              date: "2024-01-01T12:00:00",
              vendor: "Company",
              description: "salary",
              category: "Salary",
            }),
        },
      };

      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const mockGenAI = new GoogleGenerativeAI();
      mockGenAI
        .getGenerativeModel()
        .generateContent.mockResolvedValue(mockGeminiResponse);

      const response = await request(app)
        .post("/chat")
        .send({
          message: "I received $1000 salary from company today",
        })
        .expect(200);

      expect(response.body.data).toMatchObject({
        type: "income",
        amount: 1000.0,
        vendor: "Company",
        description: "salary",
        category: "Salary",
      });
    });

    it("should handle missing message", async () => {
      const response = await request(app).post("/chat").send({}).expect(400);

      expect(response.body.message).toBe(
        "Message is required and must be a non-empty string"
      );
    });

    it("should handle empty message", async () => {
      const response = await request(app)
        .post("/chat")
        .send({ message: "   " })
        .expect(400);

      expect(response.body.message).toBe(
        "Message is required and must be a non-empty string"
      );
    });

    it("should handle user not found", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/chat")
        .send({
          message: "I spent $25 at Starbucks yesterday for coffee",
        })
        .expect(404);

      expect(response.body.message).toBe("User not found");
    });

    it("should handle Gemini API errors", async () => {
      // Mock user lookup
      User.findOne.mockResolvedValue({
        id: "test-user-id",
        firebase_uid: "test-firebase-uid",
      });

      // Mock Gemini API error
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const mockGenAI = new GoogleGenerativeAI();
      mockGenAI
        .getGenerativeModel()
        .generateContent.mockRejectedValue(new Error("API Error"));

      const response = await request(app)
        .post("/chat")
        .send({
          message: "I spent $25 at Starbucks yesterday for coffee",
        })
        .expect(500);

      expect(response.body.message).toBe("Failed to process transaction");
    });
  });
});
