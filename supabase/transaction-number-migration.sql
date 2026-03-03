-- Migration to add transaction_number to transactions and payment_proof to orders
-- Run this in Supabase SQL Editor

-- Add transaction_number column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS transaction_number TEXT;

-- Create index for transaction_number
CREATE INDEX IF NOT EXISTS idx_transactions_number ON transactions(transaction_number);

-- Create function to generate transaction number
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_tx_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count FROM transactions WHERE DATE(created_at) = CURRENT_DATE;
  v_tx_number := 'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_tx_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate transaction_number
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_number IS NULL THEN
    NEW.transaction_number := generate_transaction_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_transaction_number ON transactions;
CREATE TRIGGER trigger_set_transaction_number
  BEFORE INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_transaction_number();

-- Add payment_proof column to orders table if not exists
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_proof TEXT;

-- Update existing transactions to have transaction_number
UPDATE transactions 
SET transaction_number = 'TXN-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(id::TEXT, 4, '0')
WHERE transaction_number IS NULL;
