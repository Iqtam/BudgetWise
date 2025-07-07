-- Migration to add payment tracking fields to debt table
-- Run this against your database to add the new columns

ALTER TABLE debt 
ADD COLUMN is_fully_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN fully_paid_date DATE,
ADD COLUMN last_payment_date DATE,
ADD COLUMN original_amount DECIMAL(12, 2);

-- Update existing fully paid debts (debts with amount = 0)
UPDATE debt 
SET is_fully_paid = TRUE 
WHERE amount = 0;

-- For existing debts, set original_amount to current amount (best guess)
-- This assumes existing debts haven't been paid yet
UPDATE debt 
SET original_amount = amount 
WHERE original_amount IS NULL;
