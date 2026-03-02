-- Toko Bonita Database Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  sku TEXT UNIQUE,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  cost_price DECIMAL(15,2),
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  unit TEXT DEFAULT 'pcs',
  min_stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  branch_id UUID REFERENCES branches(id),
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update profiles to reference branches after branches table exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_branch_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_branch_id_fkey 
  FOREIGN KEY (branch_id) REFERENCES branches(id);

-- Product stocks table
CREATE TABLE IF NOT EXISTS product_stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, warehouse_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  cashier_id UUID NOT NULL REFERENCES profiles(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  subtotal DECIMAL(15,2) NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'none' CHECK (discount_type IN ('percent', 'amount', 'none')),
  discount_value DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  final_amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_barcode TEXT,
  product_sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'none' CHECK (discount_type IN ('percent', 'amount', 'none')),
  discount_value DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_price DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction payments table
CREATE TABLE IF NOT EXISTS transaction_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qris', 'transfer', 'debit')),
  amount DECIMAL(15,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
  reference_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'transfer_in', 'transfer_out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reference_type TEXT CHECK (reference_type IN ('transaction', 'transfer', 'adjustment')),
  reference_id UUID,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Idempotency keys table
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_cashier ON transactions(cashier_id);
CREATE INDEX IF NOT EXISTS idx_transactions_branch ON transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_transaction_payments_transaction ON transaction_payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse ON stock_movements(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_product_stocks_product ON product_stocks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stocks_warehouse ON product_stocks(warehouse_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(user_role, 'guest');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Categories Policies
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL
  USING (get_user_role() = 'admin');

-- Products Policies
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage products"
  ON products FOR ALL
  USING (get_user_role() = 'admin');

-- Branches Policies
CREATE POLICY "Public can view active branches"
  ON branches FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage branches"
  ON branches FOR ALL
  USING (get_user_role() = 'admin');

-- Warehouses Policies
CREATE POLICY "Public can view active warehouses"
  ON warehouses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage warehouses"
  ON warehouses FOR ALL
  USING (get_user_role() = 'admin');

-- Product Stocks Policies
CREATE POLICY "Cashier can view product stocks"
  ON product_stocks FOR SELECT
  USING (get_user_role() IN ('admin', 'cashier'));

CREATE POLICY "Admin can manage product stocks"
  ON product_stocks FOR ALL
  USING (get_user_role() = 'admin');

-- Transactions Policies
CREATE POLICY "Cashier can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'cashier') AND cashier_id = auth.uid());

CREATE POLICY "Cashier can view own transactions"
  ON transactions FOR SELECT
  USING (get_user_role() IN ('admin', 'cashier'));

CREATE POLICY "Admin can manage all transactions"
  ON transactions FOR ALL
  USING (get_user_role() = 'admin');

-- Transaction Items Policies
CREATE POLICY "Cashier can create transaction items"
  ON transaction_items FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'cashier'));

CREATE POLICY "Cashier can view transaction items"
  ON transaction_items FOR SELECT
  USING (get_user_role() IN ('admin', 'cashier'));

-- Transaction Payments Policies
CREATE POLICY "Cashier can create transaction payments"
  ON transaction_payments FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'cashier'));

CREATE POLICY "Cashier can view transaction payments"
  ON transaction_payments FOR SELECT
  USING (get_user_role() IN ('admin', 'cashier'));

-- Stock Movements Policies
CREATE POLICY "Cashier can view stock movements"
  ON stock_movements FOR SELECT
  USING (get_user_role() IN ('admin', 'cashier'));

CREATE POLICY "Admin can manage stock movements"
  ON stock_movements FOR ALL
  USING (get_user_role() = 'admin');

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admin can manage all profiles"
  ON profiles FOR ALL
  USING (get_user_role() = 'admin');

-- Idempotency Keys Policies
CREATE POLICY "Service role can manage idempotency keys"
  ON idempotency_keys FOR ALL
  USING (auth.role() = 'service_role');

-- Settings Policies
CREATE POLICY "Admin can manage settings"
  ON settings FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouses_updated_at
  BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_stocks_updated_at
  BEFORE UPDATE ON product_stocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Create transaction with idempotency
CREATE OR REPLACE FUNCTION create_transaction(
  p_invoice_number TEXT,
  p_cashier_id UUID,
  p_branch_id UUID,
  p_warehouse_id UUID,
  p_items JSONB,
  p_discount_type TEXT DEFAULT 'none',
  p_discount_value DECIMAL DEFAULT 0,
  p_payments JSONB,
  p_idempotency_key TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_transaction_id UUID;
  v_subtotal DECIMAL(15,2) := 0;
  v_discount_amount DECIMAL(15,2) := 0;
  v_total_amount DECIMAL(15,2);
  v_final_amount DECIMAL(15,2);
  v_item JSONB;
  v_item_discount DECIMAL(15,2);
  v_item_total DECIMAL(15,2);
  v_product_id UUID;
  v_quantity INTEGER;
  v_unit_price DECIMAL(15,2);
  v_product_name TEXT;
  v_product_barcode TEXT;
  v_product_sku TEXT;
  v_item_discount_type TEXT;
  v_item_discount_value DECIMAL(15,2);
  v_payment JSONB;
  v_payment_total DECIMAL(15,2) := 0;
  v_existing_response JSONB;
BEGIN
  -- Check idempotency key
  SELECT response INTO v_existing_response 
  FROM idempotency_keys 
  WHERE key = p_idempotency_key;
  
  IF v_existing_response IS NOT NULL THEN
    RETURN v_existing_response;
  END IF;

  -- Calculate subtotal and validate stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_unit_price := (v_item->>'unit_price')::DECIMAL;
    v_item_discount_type := COALESCE(v_item->>'discount_type', 'none');
    v_item_discount_value := COALESCE((v_item->>'discount_value')::DECIMAL, 0);
    
    -- Get product info
    SELECT name, barcode, sku INTO v_product_name, v_product_barcode, v_product_sku
    FROM products WHERE id = v_product_id;
    
    IF v_product_name IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_product_id;
    END IF;
    
    -- Check stock with lock
    PERFORM 1 FROM product_stocks 
    WHERE product_id = v_product_id AND warehouse_id = p_warehouse_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No stock record for product % in warehouse %', v_product_id, p_warehouse_id;
    END IF;
    
    -- Calculate item discount
    IF v_item_discount_type = 'percent' THEN
      v_item_discount := (v_unit_price * v_quantity * v_item_discount_value) / 100;
    ELSIF v_item_discount_type = 'amount' THEN
      v_item_discount := v_item_discount_value * v_quantity;
    ELSE
      v_item_discount := 0;
    END IF;
    
    v_item_total := (v_unit_price * v_quantity) - v_item_discount;
    v_subtotal := v_subtotal + v_item_total;
  END LOOP;

  -- Calculate transaction discount
  IF p_discount_type = 'percent' THEN
    v_discount_amount := (v_subtotal * p_discount_value) / 100;
  ELSIF p_discount_type = 'amount' THEN
    v_discount_amount := p_discount_value;
  END IF;

  v_total_amount := v_subtotal - v_discount_amount;
  v_final_amount := v_total_amount;

  -- Validate payments
  FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
  LOOP
    v_payment_total := v_payment_total + (v_payment->>'amount')::DECIMAL;
  END LOOP;

  IF v_payment_total != v_final_amount THEN
    RAISE EXCEPTION 'Payment total (%) does not match final amount (%)', v_payment_total, v_final_amount;
  END IF;

  -- Create transaction
  INSERT INTO transactions (
    invoice_number, cashier_id, branch_id, warehouse_id,
    subtotal, discount_type, discount_value, discount_amount,
    total_amount, final_amount, notes
  ) VALUES (
    p_invoice_number, p_cashier_id, p_branch_id, p_warehouse_id,
    v_subtotal, p_discount_type, p_discount_value, v_discount_amount,
    v_total_amount, v_final_amount, p_notes
  ) RETURNING id INTO v_transaction_id;

  -- Create transaction items and update stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_unit_price := (v_item->>'unit_price')::DECIMAL;
    v_item_discount_type := COALESCE(v_item->>'discount_type', 'none');
    v_item_discount_value := COALESCE((v_item->>'discount_value')::DECIMAL, 0);
    
    SELECT name, barcode, sku INTO v_product_name, v_product_barcode, v_product_sku
    FROM products WHERE id = v_product_id;
    
    -- Calculate item discount
    IF v_item_discount_type = 'percent' THEN
      v_item_discount := (v_unit_price * v_quantity * v_item_discount_value) / 100;
    ELSIF v_item_discount_type = 'amount' THEN
      v_item_discount := v_item_discount_value * v_quantity;
    ELSE
      v_item_discount := 0;
    END IF;
    
    v_item_total := (v_unit_price * v_quantity) - v_item_discount;
    
    -- Insert transaction item
    INSERT INTO transaction_items (
      transaction_id, product_id, product_name, product_barcode, product_sku,
      quantity, unit_price, discount_type, discount_value, discount_amount, total_price
    ) VALUES (
      v_transaction_id, v_product_id, v_product_name, v_product_barcode, v_product_sku,
      v_quantity, v_unit_price, v_item_discount_type, v_item_discount_value, v_item_discount, v_item_total
    );
    
    -- Update stock (no negative)
    UPDATE product_stocks 
    SET quantity = quantity - v_quantity
    WHERE product_id = v_product_id AND warehouse_id = p_warehouse_id;
    
    -- Check for negative stock
    IF (SELECT quantity FROM product_stocks WHERE product_id = v_product_id AND warehouse_id = p_warehouse_id) < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for product %', v_product_name;
    END IF;
    
    -- Insert stock movement
    INSERT INTO stock_movements (
      product_id, warehouse_id, type, quantity, reference_type, reference_id, created_by
    ) VALUES (
      v_product_id, p_warehouse_id, 'out', v_quantity, 'transaction', v_transaction_id, p_cashier_id
    );
  END LOOP;

  -- Create transaction payments
  FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
  LOOP
    INSERT INTO transaction_payments (
      transaction_id, payment_method, amount, status, reference_number
    ) VALUES (
      v_transaction_id,
      v_payment->>'method',
      (v_payment->>'amount')::DECIMAL,
      COALESCE(v_payment->>'status', 'paid'),
      v_payment->>'reference_number'
    );
  END LOOP;

  -- Store idempotency key response
  INSERT INTO idempotency_keys (key, response, expires_at)
  VALUES (
    p_idempotency_key,
    jsonb_build_object(
      'success', true,
      'transaction_id', v_transaction_id,
      'invoice_number', p_invoice_number,
      'final_amount', v_final_amount
    ),
    now() + interval '24 hours'
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'invoice_number', p_invoice_number,
    'subtotal', v_subtotal,
    'discount_amount', v_discount_amount,
    'total_amount', v_total_amount,
    'final_amount', v_final_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA (Run after migration)
-- ============================================

-- This will be in a separate seed file
