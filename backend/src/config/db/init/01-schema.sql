-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if they exist (in correct order due to dependencies)
DROP TABLE IF EXISTS log_table CASCADE;
DROP TABLE IF EXISTS ai_extractions CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;
DROP TABLE IF EXISTS chat_interactions CASCADE;
DROP TABLE IF EXISTS recurrent_transaction CASCADE;
DROP TABLE IF EXISTS transfer CASCADE;
DROP TABLE IF EXISTS budget CASCADE;
DROP TABLE IF EXISTS saving CASCADE;
DROP TABLE IF EXISTS debt CASCADE;
DROP TABLE IF EXISTS transaction CASCADE;
DROP TABLE IF EXISTS event CASCADE;
DROP TABLE IF EXISTS category CASCADE;
DROP TABLE IF EXISTS balance CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS ai_budget_plans CASCADE;
DROP TABLE IF EXISTS user_budget_preferences CASCADE;
DROP TABLE IF EXISTS ai_insights_log CASCADE;
DROP TABLE IF EXISTS financial_snapshots CASCADE;
DROP TABLE IF EXISTS budget_plan_actions CASCADE;

-- Users table with Firebase UID and no password hash
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Firebase UID
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  last_login TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  profile_picture_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  country VARCHAR(100),
  occupation VARCHAR(100)
);

-- Balance
CREATE TABLE balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC(12, 2) DEFAULT 0.00 NOT NULL
);

-- No password reset or email verification tokens needed with Firebase

-- Categories
CREATE TABLE category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon_url TEXT,
  type VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES category(id)
);

-- Events
CREATE TABLE event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  note VARCHAR(200),
  start_date DATE,
  end_date DATE
);

-- Transactions
CREATE TABLE transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  category_id UUID REFERENCES category(id) ON DELETE SET NULL,
  type VARCHAR(50) CHECK (type IN ('income', 'expense')),
  event_id UUID REFERENCES event(id) ON DELETE SET NULL,
  recurrence BOOLEAN DEFAULT FALSE,
  confirmed BOOLEAN DEFAULT TRUE
);

-- Debts
CREATE TABLE debt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('bank', 'personal')),
  start_date DATE DEFAULT CURRENT_DATE,
  expiration_date DATE NOT NULL,
  interest_rate NUMERIC(5, 2) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  taken_from VARCHAR(50)
);

-- Savings
CREATE TABLE saving (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  start_amount NUMERIC(12, 2) NOT NULL,
  target_amount NUMERIC(12, 2),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  expired BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE
);

-- Budgets
CREATE TABLE budget (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID UNIQUE REFERENCES category(id) ON DELETE SET NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  goal_amount NUMERIC(12, 2) NOT NULL,
  spent NUMERIC(12, 2) DEFAULT 0.00,
  expired BOOLEAN DEFAULT FALSE,
  amount_exceeded BOOLEAN DEFAULT FALSE,
  icon_url TEXT
);

-- Transfers
CREATE TABLE transfer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  from_income_id UUID REFERENCES transaction(id),
  from_saving_id UUID REFERENCES saving(id),
  to_debt_id UUID REFERENCES debt(id),
  to_savings_id UUID REFERENCES saving(id),
  to_expense_id UUID REFERENCES transaction(id),
  amount NUMERIC(12, 2) NOT NULL
);

-- Recurrent transactions
CREATE TABLE recurrent_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  description TEXT,
  transaction_id UUID REFERENCES transaction(id) NOT NULL,
  start_date DATE,
  period INTEGER DEFAULT 1,
  end_date DATE,
  duration INTEGER,
  duration_type VARCHAR(20) CHECK (duration_type IN ('day', 'week', 'month', 'year')),
  recurrence_type VARCHAR(20) CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  weekday TEXT CHECK (
    weekday IS NULL OR weekday IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')
  ),
  CHECK (
    recurrence_type NOT IN ('monthly', 'yearly', 'daily') OR start_date IS NOT NULL
  ),
  CHECK (
    (recurrence_type = 'weekly' AND weekday IS NOT NULL) OR
    (recurrence_type != 'weekly' AND weekday IS NULL)
  )
);

-- Chat interactions (AI)
CREATE TABLE chat_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  interpreted_action TEXT,
  response TEXT,
  response_type VARCHAR(30) CHECK (
    response_type IN ('transaction', 'trend', 'forecast', 'suggestion', 'summary')
  ),
  linked_transaction_id UUID REFERENCES transaction(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploads
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  storage_url TEXT NOT NULL,
  parsed_text TEXT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Extraction logs
CREATE TABLE ai_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  linked_transaction_id UUID REFERENCES transaction(id) ON DELETE SET NULL,
  upload_id UUID REFERENCES uploads(id) ON DELETE SET NULL,
  source TEXT,
  interpreted_type VARCHAR(20) CHECK (interpreted_type IN ('income', 'expense', 'budget', 'debt', 'saving')),
  category_suggestion VARCHAR(100),
  amount NUMERIC(12, 2),
  extraction_method VARCHAR(20) CHECK (extraction_method IN ('chat', 'ocr')),
  confidence_score FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Change logs
CREATE TABLE log_table (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  row_id VARCHAR(128) NOT NULL,
  action VARCHAR(10) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 

-- AI Budget Plans - stores AI-generated budget recommendations
CREATE TABLE ai_budget_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  framework_type VARCHAR(50) NOT NULL, -- 50_30_20_RULE, DEBT_AVALANCHE_BUDGET, etc.
  monthly_income DECIMAL(12, 2) NOT NULL,
  category_allocations JSONB, -- stores budget allocation per category
  total_needs DECIMAL(12, 2),
  total_wants DECIMAL(12, 2),
  total_savings_debt DECIMAL(12, 2),
  confidence_score DECIMAL(3, 2), -- AI confidence in the plan (0-1)
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'rejected')),
  user_feedback JSONB, -- user's feedback on the plan
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Budget Preferences - learned preferences for personalization
CREATE TABLE user_budget_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preferred_framework VARCHAR(50), -- user's preferred budget framework
  spending_priorities JSONB, -- category priorities (high, medium, low)
  savings_preference DECIMAL(3, 2), -- preferred savings rate (0-1)
  risk_tolerance VARCHAR(20) CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  financial_goals JSONB, -- array of user's financial goals
  learning_data JSONB, -- ML data for personalization
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Insights Log - tracks insights given to avoid repetition
CREATE TABLE ai_insights_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL, -- spending_pattern, budget_deviation, etc.
  insight_content TEXT NOT NULL,
  category_id UUID REFERENCES category(id) ON DELETE SET NULL,
  relevance_score DECIMAL(3, 2), -- how relevant the insight was (0-1)
  user_action_taken BOOLEAN DEFAULT FALSE, -- did user act on the insight
  expires_at TIMESTAMP, -- when this insight becomes stale
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial Snapshots Cache - cache for expensive calculations
CREATE TABLE financial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  snapshot_type VARCHAR(30) NOT NULL, -- income_analysis, spending_analysis, etc.
  snapshot_data JSONB NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours')
);

-- Budget Plan Actions - tracks user actions from AI recommendations
CREATE TABLE budget_plan_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_budget_plan_id UUID REFERENCES ai_budget_plans(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- accepted, rejected, modified, implemented
  action_details JSONB, -- what specifically was changed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_ai_budget_plans_user_status ON ai_budget_plans(user_id, status);
CREATE INDEX idx_user_budget_preferences_user ON user_budget_preferences(user_id);
CREATE INDEX idx_ai_insights_log_user_type ON ai_insights_log(user_id, insight_type);
CREATE INDEX idx_financial_snapshots_user_type ON financial_snapshots(user_id, snapshot_type);
CREATE INDEX idx_financial_snapshots_expires ON financial_snapshots(expires_at);
CREATE INDEX idx_budget_plan_actions_plan ON budget_plan_actions(ai_budget_plan_id);

-- Add triggers to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_budget_plans_updated_at 
    BEFORE UPDATE ON ai_budget_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_budget_preferences_updated_at 
    BEFORE UPDATE ON user_budget_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 