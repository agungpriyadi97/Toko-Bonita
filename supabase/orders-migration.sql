-- Orders table for Toko Bonita
-- Run this in Supabase SQL Editor

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  notes TEXT,
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'qris', 'transfer', 'debit')),
  branch_id UUID REFERENCES branches(id),
  processed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Cashiers can view all orders
CREATE POLICY "Cashiers can view orders"
  ON orders FOR SELECT
  USING (get_user_role() IN ('admin', 'cashier'));

-- Cashiers can create orders
CREATE POLICY "Cashiers can create orders"
  ON orders FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'cashier') OR auth.role() = 'service_role');

-- Cashiers can update orders
CREATE POLICY "Cashiers can update orders"
  ON orders FOR UPDATE
  USING (get_user_role() IN ('admin', 'cashier'));

-- Order items policies
CREATE POLICY "Cashiers can view order items"
  ON order_items FOR SELECT
  USING (get_user_role() IN ('admin', 'cashier'));

CREATE POLICY "Cashiers can create order items"
  ON order_items FOR INSERT
  WITH CHECK (get_user_role() IN ('admin', 'cashier') OR auth.role() = 'service_role');

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_order_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count FROM orders WHERE DATE(created_at) = CURRENT_DATE;
  v_order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');
  RETURN v_order_number;
END;
$$ LANGUAGE plpgsql;
