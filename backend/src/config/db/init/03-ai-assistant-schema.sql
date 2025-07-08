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