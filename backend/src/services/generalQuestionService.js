const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeneralQuestionService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Handle general questions
  async handleGeneralQuestion(userId, message) {
    const prompt = `You are a helpful financial assistant. Answer this financial question in a conversational, helpful way (150-300 words):

    User question: "${message}"

    Provide practical, actionable advice. If the question is outside financial topics, politely redirect to financial matters you can help with.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        conversationalResponse: text,
        actionItems: [
          {
            id: 1,
            title: "Explore Financial Features",
            description:
              "Try asking about budget planning, expense tracking, or savings advice",
            priority: "low",
          },
        ],
      };
    } catch (error) {
      console.error("Error in general question handling:", error);
      return {
        conversationalResponse: `I'm here to help with your financial questions! I can assist you with:

- **Budget Planning** - Create personalized budgets based on your income and expenses
- **Expense Tracking** - Record and categorize your spending
- **Savings Advice** - Help you save money and reach your financial goals
- **Debt Management** - Strategies to pay off debt efficiently
- **Financial Insights** - Analyze your spending patterns and financial health

What would you like help with today?`,
      };
    }
  }
}

module.exports = GeneralQuestionService;
