const { GoogleGenerativeAI } = require("@google/generative-ai");

class ExpenseTrackingService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Handle expense tracking requests
  async handleExpenseTracking(userId, message) {
    // Generate LLM response
    const response = await this.generateExpenseTrackingLLMResponse(message);

    return {
      conversationalResponse: response.conversationalResponse,
      actionItems: response.actionItems,
      insights: response.insights,
    };
  }

  // Generate LLM response for expense tracking
  async generateExpenseTrackingLLMResponse(userMessage) {
    const prompt = this.createExpenseTrackingPrompt(userMessage);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        conversationalResponse: text,
        actionItems: this.generateExpenseTrackingActionItems(),
        insights: this.generateExpenseTrackingInsights(),
      };
    } catch (error) {
      console.error("Error generating expense tracking LLM response:", error);
      return {
        conversationalResponse: this.generateFallbackExpenseTrackingResponse(),
        actionItems: this.generateExpenseTrackingActionItems(),
        insights: this.generateExpenseTrackingInsights(),
      };
    }
  }

  // Create prompt for expense tracking
  createExpenseTrackingPrompt(userMessage) {
    return `You are a helpful financial assistant specializing in expense tracking and categorization.

## Instructions
- Write in a friendly, supportive, and helpful tone
- Use Markdown formatting for clarity and engagement
- Provide specific guidance on expense tracking methods
- Be encouraging about the benefits of tracking expenses
- Address the user's specific message if provided

## User Context
- **User Message:** "${userMessage}"
- **Service:** Expense Tracking and Categorization

---

### Please format your response using Markdown with the following structure:

## Expense Tracking Guide
Start with an encouraging overview of expense tracking benefits and methods.

## How to Track Expenses
- **Natural Language Input:** [Explain how to describe expenses in chat]
- **Receipt Upload:** [Explain photo receipt processing]
- **Manual Entry:** [Explain manual transaction entry]

## Best Practices
- **Regular Tracking:** [Why consistent tracking matters]
- **Categorization:** [How categories help with analysis]
- **Receipt Management:** [Tips for organizing receipts]

## Getting Started
- [Specific, actionable steps the user can take]

---

Focus on being helpful and encouraging. Explain the benefits of expense tracking for financial awareness and budget management. Format your response using Markdown for clarity and readability.`;
  }

  // Generate fallback response if LLM fails
  generateFallbackExpenseTrackingResponse() {
    return `I can help you track expenses! You can tell me about your purchases in natural language, like "I spent $25 at Starbucks" or "Bought groceries for $80 yesterday." 

I'll automatically categorize your expenses and add them to your transaction history. You can also upload receipt photos for automatic expense extraction.

Would you like to tell me about a recent expense, or would you prefer to use the receipt scanner?`;
  }

  // Generate action items for expense tracking
  generateExpenseTrackingActionItems() {
    return [
      {
        id: 1,
        title: "Add Expense via Chat",
        description: "Tell me about your expense in natural language",
        priority: "high",
      },
      {
        id: 2,
        title: "Upload Receipt",
        description: "Take a photo of your receipt for automatic processing",
        priority: "medium",
      },
    ];
  }

  // Generate insights for expense tracking
  generateExpenseTrackingInsights() {
    return [
      {
        type: "tip",
        title: "Expense Tracking Tips",
        message:
          "Regular expense tracking helps you stay within budget and identify spending patterns.",
      },
    ];
  }
}

module.exports = ExpenseTrackingService;
