-- Add indexes to improve query performance
-- Run this in Supabase SQL Editor

-- Index for orders table
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Index for order_items table
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Index for transactions table
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_number ON transactions(transaction_number);
