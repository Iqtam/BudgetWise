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
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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

