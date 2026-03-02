-- ============================================
-- MIGRATION: Add Transaction Number & Order Columns
-- Copy paste dan jalankan di Supabase SQL Editor
-- ============================================

-- 1. Add transaction_number column to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS transaction_number TEXT;

-- 2. Create index for faster search
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_number ON transactions(transaction_number);

-- 3. Update RPC function to generate transaction_number
CREATE OR REPLACE FUNCTION create_transaction(
  p_idem_key TEXT,
  p_cashier_id UUID,
  p_branch_id UUID,
  p_warehouse_id UUID,
  p_items JSONB,
  p_tx_discount_type TEXT DEFAULT 'none',
  p_tx_discount_value DECIMAL(15,2) DEFAULT 0,
  p_payment JSONB DEFAULT '{}'
) RETURNS JSON AS $$
DECLARE
  v_transaction_id UUID;
  v_transaction_number TEXT;
  v_subtotal DECIMAL(15,2) := 0;
  v_discount_amount DECIMAL(15,2) := 0;
  v_final_amount DECIMAL(15,2);
  v_payment_method TEXT;
  v_payment_status TEXT;
  v_cash_received DECIMAL(15,2) := 0;
  v_change_amount DECIMAL(15,2) := 0;
  v_notes TEXT := '';
  v_item JSONB;
  v_item_subtotal DECIMAL(15,2);
  v_item_discount DECIMAL(15,2);
  v_item_final DECIMAL(15,2);
  v_count INTEGER;
BEGIN
  -- Check idempotency
  SELECT transaction_id INTO v_transaction_id 
  FROM idempotency_keys 
  WHERE key = p_idem_key;
  
  IF v_transaction_id IS NOT NULL THEN
    RETURN json_build_object(
      'transaction_id', v_transaction_id,
      'already_processed', true
    );
  END IF;

  -- Extract payment info
  v_payment_method := COALESCE(p_payment->>'payment_method', 'cash');
  v_payment_status := COALESCE(p_payment->>'payment_status', 'paid');
  v_cash_received := COALESCE((p_payment->>'cash_received')::DECIMAL, 0);
  v_notes := COALESCE(p_payment->>'notes', '');

  -- Calculate subtotal from items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_subtotal := (v_item->>'qty')::INT * (v_item->>'unit_price')::DECIMAL;
    v_subtotal := v_subtotal + v_item_subtotal;
  END LOOP;

  -- Calculate transaction discount
  IF p_tx_discount_type = 'percent' THEN
    v_discount_amount := ROUND(v_subtotal * p_tx_discount_value / 100);
  ELSIF p_tx_discount_type = 'amount' THEN
    v_discount_amount := LEAST(p_tx_discount_value, v_subtotal);
  END IF;

  v_final_amount := v_subtotal - v_discount_amount;

  -- Calculate change for cash payment
  IF v_payment_method = 'cash' AND v_cash_received >= v_final_amount THEN
    v_change_amount := v_cash_received - v_final_amount;
  END IF;

  -- Generate transaction number
  SELECT COUNT(*) + 1 INTO v_count 
  FROM transactions 
  WHERE DATE(created_at) = CURRENT_DATE;
  
  v_transaction_number := 'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');

  -- Create transaction
  INSERT INTO transactions (
    cashier_id, branch_id, warehouse_id,
    subtotal_amount, discount_type, discount_value, discount_amount, final_amount,
    payment_method, payment_status, cash_received, change_amount, notes,
    transaction_number
  ) VALUES (
    p_cashier_id, p_branch_id, p_warehouse_id,
    v_subtotal, p_tx_discount_type, p_tx_discount_value, v_discount_amount, v_final_amount,
    v_payment_method, v_payment_status, v_cash_received, v_change_amount, v_notes,
    v_transaction_number
  ) RETURNING id INTO v_transaction_id;

  -- Create transaction items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_subtotal := (v_item->>'qty')::INT * (v_item->>'unit_price')::DECIMAL;
    
    INSERT INTO transaction_items (
      transaction_id, product_id, qty, unit_price, subtotal,
      discount_type, discount_value, discount_amount, final_subtotal
    ) VALUES (
      v_transaction_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'qty')::INT,
      (v_item->>'unit_price')::DECIMAL,
      v_item_subtotal,
      COALESCE(v_item->>'discount_type', 'none'),
      COALESCE((v_item->>'discount_value')::DECIMAL, 0),
      0,
      v_item_subtotal
    );
    
    -- Update stock
    UPDATE product_stocks
    SET stock = stock - (v_item->>'qty')::INT
    WHERE product_id = (v_item->>'product_id')::UUID
    AND warehouse_id = p_warehouse_id;
  END LOOP;

  -- Store idempotency key
  INSERT INTO idempotency_keys (key, cashier_id, transaction_id)
  VALUES (p_idem_key, p_cashier_id, v_transaction_id);

  RETURN json_build_object(
    'transaction_id', v_transaction_id,
    'transaction_number', v_transaction_number,
    'final_amount', v_final_amount,
    'change_amount', v_change_amount
  );
END;
$$ LANGUAGE plpgsql;

-- 4. Update existing transactions with transaction numbers
UPDATE transactions 
SET transaction_number = 'TXN-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(ROW_NUMBER() OVER (PARTITION BY DATE(created_at) ORDER BY created_at)::TEXT, 4, '0')
WHERE transaction_number IS NULL;

-- 5. Add payment_proof column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_proof TEXT;

-- ============================================
-- SELESAI! 
-- Jalankan query di atas di Supabase SQL Editor
-- ============================================
