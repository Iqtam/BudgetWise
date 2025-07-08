# BudgetWise AI Assistant Setup Guide

This guide covers the complete setup and implementation of the AI-powered BudgetPlannerAgent in your BudgetWise application.

## 🚀 Implementation Overview

The AI Assistant implementation includes:

### Backend Components
- **BudgetPlannerAgent** (`/backend/src/services/budgetPlannerAgent.js`) - Core AI agent for budget planning
- **AIAssistantService** (`/backend/src/services/aiAssistantService.js`) - Main orchestration service
- **AIAssistantController** (`/backend/src/controllers/aiAssistantController.js`) - REST API endpoints
- **Database Schema** (`/backend/src/config/db/init/03-ai-assistant-schema.sql`) - Additional tables
- **Models** - Sequelize models for AI data storage
- **Routes** (`/backend/src/routes/aiAssistantRoutes.js`) - API route definitions
- **Tests** (`/backend/src/tests/__tests__/budgetPlannerAgent.test.js`) - Comprehensive unit tests

### Frontend Components
- **AI Assistant Service** (`/frontend/src/lib/services/aiAssistant.ts`) - API client
- **Enhanced Chat Interface** (`/frontend/src/routes/dashboard/chat/+page.svelte`) - Rich UI with action items, insights
- **TypeScript Interfaces** - Type definitions for AI responses

## 🛠️ Environment Setup

### 1. Backend Environment Variables

Add to your `backend/.env` file:

```bash
# AI Assistant Configuration
GEMINI_API_KEY=your_google_gemini_api_key

# Existing variables (keep these)
PORT=5000
NODE_ENV=development
DB_NAME=budgetwise_db
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
FIREBASE_PROJECT_ID=your_firebase_project_id
# ... other Firebase config
```

### 2. Get Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file

### 3. Install Dependencies

The required dependencies should already be installed, but verify:

```bash
cd backend
npm install @google/generative-ai
```

## 🗄️ Database Setup

### 1. Run Database Migrations

Execute the new AI Assistant schema:

```bash
# Connect to your PostgreSQL database and run:
psql -U your_username -d budgetwise_db -f src/config/db/init/03-ai-assistant-schema.sql
```

Or manually execute the SQL schema in your database management tool.

### 2. Verify Tables Created

The following tables should be created:
- `ai_budget_plans` - Stores AI-generated budget recommendations
- `user_budget_preferences` - User preferences for personalization
- `ai_insights_log` - Tracks insights to avoid repetition
- `financial_snapshots` - Cache for expensive calculations
- `budget_plan_actions` - User actions from recommendations

## 🧪 Testing

### 1. Run Unit Tests

```bash
cd backend
npm test -- budgetPlannerAgent.test.js
```

### 2. Test API Endpoints

Start the server and test the endpoints:

```bash
cd backend
npm start
```

Test endpoints:
- `POST /api/assistant/chat` - Main chat interface
- `POST /api/assistant/budget/plan` - Create budget plan
- `GET /api/assistant/insights` - Get financial insights
- `GET /api/assistant/capabilities` - Get AI capabilities

## 🎨 Frontend Integration

The frontend is already updated with the new AI service. Key features:

### Enhanced Chat Interface
- Real-time AI responses using Google Gemini
- Rich UI components for budget summaries
- Action items with priority levels
- Financial insights and tips
- Budget projections and analysis

### Quick Actions
- Budget plan creation
- Financial insights
- Savings advice
- Debt management help

## 🔧 API Endpoints

### Core Chat
- `POST /api/assistant/chat` - Process user messages
- `GET /api/assistant/chat/history` - Get chat history
- `DELETE /api/assistant/chat/history` - Clear chat history

### Specialized Services
- `POST /api/assistant/budget/plan` - Generate budget plan
- `GET /api/assistant/insights` - Financial analysis
- `POST /api/assistant/savings/advice` - Savings recommendations
- `POST /api/assistant/debt/advice` - Debt management help
- `GET /api/assistant/capabilities` - Available features

## 🤖 AI Features

### Budget Planning
- **Framework Selection**: Automatically selects best budget framework (50-30-20, Envelope, Debt Avalanche)
- **Income Analysis**: Analyzes income patterns, stability, and trends
- **Spending Analysis**: Categorizes and analyzes spending patterns
- **Debt Integration**: Incorporates debt payoff strategies
- **Savings Optimization**: Aligns budgets with savings goals

### Intent Classification
- **Rule-based + LLM**: Hybrid approach for accurate intent detection
- **Supported Intents**:
  - BUDGET_PLANNING
  - EXPENSE_TRACKING
  - SAVINGS_ADVICE
  - DEBT_MANAGEMENT
  - FINANCIAL_INSIGHTS
  - GENERAL_QUESTION

### Response Generation
- **Conversational AI**: Natural language responses using Google Gemini
- **Structured Data**: Action items, insights, and projections
- **Personalization**: Learns from user interactions
- **Error Handling**: Graceful fallbacks when AI is unavailable

## 📊 Budget Frameworks

### 1. 50-30-20 Rule
- **When**: Stable income, moderate debt
- **Allocation**: 50% needs, 30% wants, 20% savings/debt

### 2. Envelope System
- **When**: Lower income, need strict control
- **Allocation**: Fixed amounts for specific categories

### 3. Debt Avalanche
- **When**: High-interest debt present
- **Strategy**: Minimum payments + extra to highest interest debt

### 4. Balanced Approach
- **When**: Variable income or mixed priorities
- **Strategy**: Flexible allocation based on circumstances

## 🔍 Monitoring & Analytics

### Chat Interactions
All conversations are logged in `chat_interactions` table with:
- User input
- AI interpretation
- Response content
- Response type
- Timestamp

### Budget Plan Tracking
AI-generated plans stored in `ai_budget_plans` with:
- Framework used
- Category allocations
- User feedback
- Success metrics

### User Learning
System learns from user behavior via `user_budget_preferences`:
- Preferred frameworks
- Spending priorities
- Risk tolerance
- Financial goals

## 🚨 Error Handling

### Backend
- Graceful LLM failures with fallback responses
- Database connection error handling
- Input validation and sanitization
- Rate limiting protection

### Frontend
- Network error recovery
- Loading states
- User-friendly error messages
- Offline functionality considerations

## 🔒 Security Considerations

### Authentication
- Firebase token verification required
- User-specific data isolation
- Role-based access control

### Data Privacy
- Financial data encrypted in transit
- PII handling compliance
- Audit logging for sensitive operations

### API Security
- Rate limiting on AI endpoints
- Input sanitization
- SQL injection prevention
- CORS configuration

## 📈 Performance Optimization

### Caching
- Financial snapshots cached for 24 hours
- Expensive calculations stored in `financial_snapshots`
- LLM response caching for common queries

### Database
- Indexed queries for performance
- Connection pooling
- Query optimization

### AI Efficiency
- Smart prompt engineering
- Fallback mechanisms
- Response streaming for better UX

## 🎯 Usage Examples

### Budget Planning
```
User: "Help me create a budget plan"
AI: [Analyzes income, expenses, debts] → Returns 50-30-20 plan with specific allocations
```

### Expense Tracking
```
User: "I spent $50 on groceries"
AI: [Categorizes expense] → Updates budget, provides insights
```

### Savings Advice
```
User: "How can I save more money?"
AI: [Analyzes spending patterns] → Personalized savings strategies
```

### Debt Management
```
User: "Help me pay off my credit cards"
AI: [Analyzes debt situation] → Debt avalanche/snowball strategy
```

## 🔄 Future Enhancements

### Machine Learning
- Advanced spending prediction
- Anomaly detection
- Personalized recommendations

### Integration
- Bank account connectivity
- Investment portfolio analysis
- Tax optimization

### Features
- Voice interface
- Mobile push notifications
- Advanced reporting

## 🐛 Troubleshooting

### Common Issues

1. **Gemini API Key Issues**
   - Verify key is valid and has quota
   - Check environment variable is loaded
   - Test with simple API call

2. **Database Connection**
   - Verify new tables are created
   - Check connection string
   - Test database permissions

3. **Frontend Integration**
   - Verify API URL is correct
   - Check network requests in browser dev tools
   - Validate authentication tokens

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` and checking console outputs.

## 📝 Maintenance

### Regular Tasks
- Monitor API usage and costs
- Review and update prompts
- Analyze user feedback
- Clean up old chat history
- Update AI models as available

### Performance Monitoring
- Track response times
- Monitor error rates
- Analyze user satisfaction
- Review resource usage

---

## 🎉 You're Ready!

The AI Assistant is now fully implemented and ready to help users with:
- Intelligent budget planning
- Personalized financial advice
- Expense tracking and categorization
- Debt management strategies
- Savings optimization
- Financial insights and analytics

Users can interact naturally through the chat interface and receive comprehensive, actionable financial guidance powered by advanced AI. 