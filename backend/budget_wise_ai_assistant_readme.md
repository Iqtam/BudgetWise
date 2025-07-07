# 📘 BudgetWise AI Assistant Chatbot – System Overview

## 🧠 Purpose

The BudgetWise AI Assistant is an intelligent, context-aware financial chatbot that helps users **optimize budgets**, **plan savings goals**, and **simulate financial decisions** using modular AI agents, personalized memory, and LLM-powered responses.

It goes beyond static budget tracking by **conversationally guiding users** through adaptive financial planning with smart suggestions, insights, and simulations.

---

## 🏗️ System Architecture

```
Frontend (Svelte Chat UI)
   ⇉
Backend API: /api/assistant/chat 
   ⇉
ChatAssistantService (Orchestrator)
   ⇉
IntentClassifier → Agent Router
   ⇉                ⇉
MemoryManager    + Agents
                 |— BudgetPlannerAgent
                 |— ReallocationAgent
                 |— SavingsGoalAgent
                 |— SimulationAgent
                 |— InsightAgent
                 
   ⇉
PromptFormatter + LLMClient (GPT)
```

---

## 💬 Key Features

- **Natural Language Understanding**

  - Handles queries like:
    - “Help me plan a budget”
    - “Where can I save more?”
    - “What if I cut food by ৳000?”

- **Modular Agent-Based Reasoning**

  - Each agent is responsible for a financial action (planning, reallocation, simulation, etc.)

- **Personalized Memory**

  - Tracks user preferences, goals, past insights, and multi-turn chat

- **Hybrid Intelligence**

  - Core financial logic runs in code for accuracy
  - LLMs are used for fluent, personalized explanations

---

## 🧠 Memory System

### MemoryManager supports:

| Type                 | Purpose                           | Storage        |
| -------------------- | --------------------------------- | -------------- |
| `chat_history`       | Multi-turn continuity             | Redis          |
| `financial_snapshot` | Cached income, expenses, budgets  | Redis          |
| `savings_goal`       | Goal target, deadline, progress   | Postgres       |
| `user_preferences`   | Response tone, insight frequency  | Postgres       |
| `insight_log`        | Recently given suggestions        | Redis/Postgres |
| `reminders`          | Monthly or goal-related reminders | Postgres       |

---

## 🧹 Agent Details & Workflows

### 1. `BudgetPlannerAgent`

**Purpose**: Create a monthly budget based on income, expenses, debts, and savings goals.

**Workflow**:

- Fetch income, fixed expenses, debt, and goals
- Apply rule-based budget allocation (e.g., 50-30-20 or envelope system)
- Adjust categories based on user habits
- Generate summary using LLM
- Store recommended budget in memory for future reference

---

### 2. `ReallocationAgent`

**Purpose**: Suggest budget shifts from underused to overused categories.

**Workflow**:

- Compare current spending to budget across categories
- Detect low usage (<40%) and high usage (>90%) categories
- Calculate optimal transfer amount
- Build justification and response via LLM
- Update memory with reallocation log

---

### 3. `SavingsGoalAgent`

**Purpose**: Help users set and adapt savings goals.

**Workflow**:

- Parse goal amount and deadline from user input
- Retrieve or create savings goal in memory
- Calculate required monthly savings
- Compare with user's surplus income
- Suggest adjustments (cut spending or extend goal)
- Generate fluent plan with LLM

---

### 4. `SimulationAgent`

**Purpose**: Answer "what if" questions by simulating budget or spending changes.

**Workflow**:

- Parse simulation request (e.g., reduce entertainment by ৳000)
- Modify relevant category
- Recalculate savings surplus or goal progress
- Evaluate impact on savings timeline or budget stability
- Reply with simulated outcome and LLM explanation
- Store simulation in memory

---

### 5. `InsightAgent`

**Purpose**: Detect patterns and provide proactive financial tips.

**Workflow**:

- Analyze historical spending trends
- Check for anomalies, repeated overspending, missed goals
- Avoid repeating recent advice (via insight log)
- Generate 2–3 insights using rule-based and LLM judgment
- Store delivered insights for deduplication

---


## 🔁 Chat Flow (End-to-End Example)

**User**: “I want to save ৳60,000 by December.”

1. `IntentClassifier` → `SAVINGS_PLAN`
2. `SavingsGoalAgent`:
   - Fetch income/expenses
   - Calculate monthly saving need
   - Suggest changes if shortfall
   - Use LLM to phrase reply
3. Memory:
   - Save goal + timeline
   - Store chat in Redis
4. Return:
   - Chat message + goal card + savings forecast

---

## ⚙️ Implementation Notes

- **LLMs** are used only when:
  - A fluent response is needed
  - Complex suggestions require explanation
- **Reasoning logic** stays in backend Java code for precision
- **MemoryManager** abstracts both Redis and Postgres for seamless access

---



## 📈 Future Extensibility

| Feature                   | New Agent            |
| ------------------------- | -------------------- |
| Debt payment optimization | `DebtOptimizerAgent` |
| Financial health scoring  | `ScoreAgent`         |
| Investment planning       | `InvestmentAgent`    |
| Long-term goal tracking   | `GoalTrackerAgent`   |

---

## ✅ Summary

The BudgetWise AI Assistant is a **modular, intelligent financial planning agent**, combining:

- Contextual memory
- Rule-driven budget logic
- LLM-powered explanations
- Personalized multi-agent workflows

It’s built for flexibility, explainability, and user empowerment — with room to grow into a full autonomous finance planner.

