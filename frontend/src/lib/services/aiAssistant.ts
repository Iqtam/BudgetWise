import { auth } from '$lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { PUBLIC_BACKEND_API_URL } from '$env/static/public';

const API_BASE_URL = PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  actionItems?: ActionItem[];
  insights?: Insight[];
  budgetSummary?: BudgetSummary;
  projections?: Projections;
}

interface ActionItem {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime?: string;
}

interface Insight {
  type: 'info' | 'warning' | 'tip';
  title: string;
  message: string;
}

interface BudgetSummary {
  framework: string;
  totalMonthlyBudget: number;
  allocationBreakdown?: {
    needs: number;
    wants: number;
    savingsAndDebt: number;
  };
  categoryCount: number;
  createdAt: string;
}

interface Projections {
  monthlySurplus: number;
  yearlyProjection: number;
  budgetUtilization: number;
  emergencyFundTimeline?: number;
}

interface ChatResponse {
  success: boolean;
  data: {
    intent: string;
    conversationalResponse: string;
    budgetSummary?: BudgetSummary;
    actionItems: ActionItem[];
    insights: Insight[];
    projections?: Projections;
    financialSnapshot?: any;
  };
  message?: string;
  error?: string;
}

interface ChatHistory {
  chatHistory: Array<{
    id: string;
    input_text: string;
    interpreted_action: string;
    response: string;
    response_type: string;
    created_at: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface Capabilities {
  features: Array<{
    name: string;
    description: string;
    examples: string[];
  }>;
  supportedIntents: string[];
  responseTypes: string[];
}

class AIAssistantService {
  // Helper function to wait for auth to be ready and get Firebase token
  private async getAuthToken(): Promise<string | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          try {
            const token = await user.getIdToken(true);
            resolve(token);
          } catch (error) {
            console.error('Error getting token:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  // Helper function for API calls with proper authentication
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    const token = await this.getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  }

  async sendMessage(message: string, conversationContext?: any): Promise<ChatResponse> {
    try {
      return await this.apiCall('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          conversationContext: conversationContext || {}
        })
      });
    } catch (error) {
      console.error('Error sending message to AI assistant:', error);
      throw error;
    }
  }

  async getChatHistory(page: number = 1, limit: number = 20): Promise<ChatHistory> {
    try {
      const result = await this.apiCall(`/assistant/chat/history?page=${page}&limit=${limit}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  async deleteChatHistory(): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/assistant/chat/history`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete chat history');
      }
    } catch (error) {
      console.error('Error deleting chat history:', error);
      throw error;
    }
  }

  async getCapabilities(): Promise<Capabilities> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/assistant/capabilities`, {
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch capabilities');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching AI capabilities:', error);
      throw error;
    }
  }

  async createBudgetPlan(context?: any): Promise<ChatResponse> {
    try {
      return await this.apiCall('/assistant/budget/plan', {
        method: 'POST',
        body: JSON.stringify({ context: context || {} })
      });
    } catch (error) {
      console.error('Error creating budget plan:', error);
      throw error;
    }
  }

  async getFinancialInsights(): Promise<ChatResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/assistant/insights`, {
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to get financial insights');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting financial insights:', error);
      throw error;
    }
  }

  async getSavingsAdvice(message?: string): Promise<ChatResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/assistant/savings/advice`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: message || 'Savings advice request' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to get savings advice');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting savings advice:', error);
      throw error;
    }
  }

  async getDebtAdvice(message?: string): Promise<ChatResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}/assistant/debt/advice`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: message || 'Debt management advice request' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to get debt advice');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting debt advice:', error);
      throw error;
    }
  }

  // Helper method to convert API response to UI message format
  convertToMessage(response: ChatResponse, userInput: string, messageId: number): Message[] {
    const messages: Message[] = [];

    // User message
    messages.push({
      id: messageId,
      type: 'user',
      content: userInput,
      timestamp: new Date()
    });

    // Assistant response
    messages.push({
      id: messageId + 1,
      type: 'assistant',
      content: response.data.conversationalResponse,
      timestamp: new Date(),
      intent: response.data.intent,
      actionItems: response.data.actionItems,
      insights: response.data.insights,
      budgetSummary: response.data.budgetSummary,
      projections: response.data.projections
    });

    return messages;
  }

  // Helper method to load chat history into message format
  convertHistoryToMessages(history: ChatHistory['chatHistory']): Message[] {
    const messages: Message[] = [];
    let messageId = 1;

    history.forEach((item) => {
      // User message
      messages.push({
        id: messageId++,
        type: 'user',
        content: item.input_text,
        timestamp: new Date(item.created_at)
      });

      // Assistant response
      messages.push({
        id: messageId++,
        type: 'assistant',
        content: item.response,
        timestamp: new Date(item.created_at),
        intent: item.interpreted_action
      });
    });

    return messages;
  }
}

export const aiAssistantService = new AIAssistantService();
export type { Message, ActionItem, Insight, BudgetSummary, Projections, ChatResponse, Capabilities }; 