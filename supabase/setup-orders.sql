-- =============================================
-- TOKO BONITA - ORDERS & NOTIFICATIONS TABLES
-- Jalankan ini di Supabase SQL Editor
-- =============================================

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('new_order', 'transaction_completed', 'low_stock', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read) WHERE is_read = false;

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage notifications"
  ON notifications FOR ALL
  USING (true);

-- ============================================
-- ORDERS TABLE
-- ============================================

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

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================

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

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- RLS Policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update orders"
  ON orders FOR UPDATE
  USING (true);

CREATE POLICY "Users can view order items"
  ON order_items FOR SELECT
  USING (true);

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ============================================
-- TRIGGER for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

SELECT 'Tabel orders, order_items, dan notifications berhasil dibuat!' as message;
