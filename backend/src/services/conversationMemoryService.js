const { Op } = require("sequelize");
const ChatInteraction = require("../models/ChatInteraction");

class ConversationMemoryService {
  constructor() {
    this.memoryWindow = 10; // Keep last 10 interactions in memory
    this.contextDecay = 0.8; // Context importance decays over time
  }

  // Get recent conversation context for a user
  async getConversationContext(userId, currentMessage) {
    try {
      // Get recent chat interactions
      const recentInteractions = await ChatInteraction.findAll({
        where: { user_id: userId },
        order: [["created_at", "DESC"]],
        limit: this.memoryWindow,
        attributes: [
          "input_text",
          "interpreted_action",
          "response",
          "response_type",
          "created_at",
        ],
      });

      if (recentInteractions.length === 0) {
        return {
          hasContext: false,
          context: "",
          recentTopics: [],
          userPreferences: {},
        };
      }

      // Build conversation context
      const context = this.buildConversationContext(
        recentInteractions,
        currentMessage
      );
      const recentTopics = this.extractRecentTopics(recentInteractions);
      const userPreferences = this.extractUserPreferences(recentInteractions);

      return {
        hasContext: true,
        context,
        recentTopics,
        userPreferences,
        interactionCount: recentInteractions.length,
      };
    } catch (error) {
      console.error("Error getting conversation context:", error);
      return {
        hasContext: false,
        context: "",
        recentTopics: [],
        userPreferences: {},
      };
    }
  }

  // Build conversation context from recent interactions
  buildConversationContext(interactions, currentMessage) {
    const contextParts = [];

    // Add recent conversation summary
    if (interactions.length > 0) {
      const recentSummary = this.summarizeRecentConversation(interactions);
      contextParts.push(`Recent conversation: ${recentSummary}`);
    }

    // Add current message context
    if (currentMessage) {
      contextParts.push(`Current user message: "${currentMessage}"`);
    }

    // Add user's recent actions and responses
    const recentActions = interactions
      .slice(0, 3) // Last 3 interactions
      .map((interaction) => {
        const timeAgo = this.getTimeAgo(interaction.created_at);
        return `- ${timeAgo}: User asked about ${interaction.interpreted_action.replace(
          "_",
          " "
        )}`;
      })
      .join("\n");

    if (recentActions) {
      contextParts.push(`Recent user actions:\n${recentActions}`);
    }

    return contextParts.join("\n\n");
  }

  // Summarize recent conversation
  summarizeRecentConversation(interactions) {
    const topics = new Set();
    const actions = new Set();

    interactions.forEach((interaction) => {
      if (interaction.interpreted_action) {
        actions.add(interaction.interpreted_action.replace("_", " "));
      }
    });

    const actionList = Array.from(actions).slice(0, 3);
    return `User has recently discussed: ${actionList.join(", ")}`;
  }

  // Extract recent topics from interactions
  extractRecentTopics(interactions) {
    const topics = new Map();

    interactions.forEach((interaction) => {
      const action = interaction.interpreted_action;
      if (action) {
        const topic = this.categorizeTopic(action);
        topics.set(topic, (topics.get(topic) || 0) + 1);
      }
    });

    return Array.from(topics.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, frequency: count }));
  }

  // Categorize topics from actions
  categorizeTopic(action) {
    const actionLower = action.toLowerCase();

    if (actionLower.includes("budget")) return "Budget Planning";
    if (actionLower.includes("insight") || actionLower.includes("analysis"))
      return "Financial Analysis";
    if (actionLower.includes("saving")) return "Savings";
    if (actionLower.includes("debt")) return "Debt Management";
    if (actionLower.includes("expense") || actionLower.includes("tracking"))
      return "Expense Tracking";
    if (actionLower.includes("reallocation")) return "Budget Reallocation";

    return "General Financial Advice";
  }

  // Extract user preferences from conversation history
  extractUserPreferences(interactions) {
    const preferences = {
      preferredTopics: [],
      communicationStyle: "general",
      detailLevel: "moderate",
    };

    // Analyze preferred topics
    const topicCounts = new Map();
    interactions.forEach((interaction) => {
      const topic = this.categorizeTopic(interaction.interpreted_action);
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    });

    preferences.preferredTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic);

    // Analyze communication style based on response length
    const avgResponseLength =
      interactions.reduce(
        (sum, interaction) => sum + (interaction.response?.length || 0),
        0
      ) / interactions.length;

    if (avgResponseLength > 500) {
      preferences.communicationStyle = "detailed";
      preferences.detailLevel = "high";
    } else if (avgResponseLength < 200) {
      preferences.communicationStyle = "concise";
      preferences.detailLevel = "low";
    }

    return preferences;
  }

  // Get time ago string
  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }

  // Check if current message is a follow-up question
  isFollowUpQuestion(currentMessage, recentTopics) {
    const followUpIndicators = [
      "what about",
      "how about",
      "and",
      "also",
      "additionally",
      "furthermore",
      "moreover",
      "besides",
      "in addition",
      "what if",
      "can you",
      "could you",
      "would you",
      "tell me more",
      "explain",
      "elaborate",
      "expand",
    ];

    const messageLower = currentMessage.toLowerCase();
    return followUpIndicators.some((indicator) =>
      messageLower.includes(indicator)
    );
  }

  // Generate context-aware prompt enhancement
  enhancePromptWithContext(basePrompt, conversationContext) {
    if (!conversationContext.hasContext) {
      return basePrompt;
    }

    const contextEnhancement = `

## Conversation Context
${conversationContext.context}

## User Preferences
- Preferred Topics: ${conversationContext.userPreferences.preferredTopics.join(
      ", "
    )}
- Communication Style: ${conversationContext.userPreferences.communicationStyle}
- Detail Level: ${conversationContext.userPreferences.detailLevel}

## Instructions for Context-Aware Response
- Reference previous conversation topics when relevant
- Build upon previous advice and recommendations
- Maintain consistency with earlier suggestions
- Address any follow-up questions or clarifications
- Use the user's preferred communication style
- Provide appropriate detail level based on user preferences`;

    return basePrompt + contextEnhancement;
  }

  // Store interaction for future context
  async storeInteraction(
    userId,
    inputText,
    interpretedAction,
    response,
    responseType
  ) {
    try {
      await ChatInteraction.create({
        user_id: userId,
        input_text: inputText,
        interpreted_action: interpretedAction,
        response: response,
        response_type: responseType,
      });
    } catch (error) {
      console.error("Error storing conversation interaction:", error);
    }
  }
}

module.exports = ConversationMemoryService;
