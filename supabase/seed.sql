-- Toko Bonita Seed Data
-- Run this after migration.sql

-- ============================================
-- BRANCHES
-- ============================================

INSERT INTO branches (id, name, address, phone, is_active) VALUES
  ('branch-001', 'Toko Bonita Pusat', 'Jl. Raya Serang No. 123, Tangerang', '021-1234567', true),
  ('branch-002', 'Toko Bonita Mall', 'Mall Balaraja Lt. 2 No. 45, Tangerang', '021-7654321', true);

-- ============================================
-- WAREHOUSES
-- ============================================

INSERT INTO warehouses (id, name, branch_id, address, is_active) VALUES
  ('warehouse-001', 'Gudang Pusat', 'branch-001', 'Jl. Raya Serang No. 123, Tangerang', true),
  ('warehouse-002', 'Gudang Mall', 'branch-002', 'Mall Balaraya Lt. B1, Tangerang', true);

-- ============================================
-- CATEGORIES
-- ============================================

INSERT INTO categories (id, name, slug, description, is_active, sort_order) VALUES
  ('cat-001', 'Kosmetik', 'kosmetik', 'Produk kecantikan dan perawatan wajah', true, 1),
  ('cat-002', 'Skincare', 'skincare', 'Produk perawatan kulit', true, 2),
  ('cat-003', 'Susu Bayi', 'susu-bayi', 'Susu formula untuk bayi dan anak', true, 3),
  ('cat-004', 'Diapers', 'diapers', 'Popok bayi dan anak', true, 4),
  ('cat-005', 'Perlengkapan Bayi', 'perlengkapan-bayi', 'Berbagai perlengkapan bayi', true, 5),
  ('cat-006', 'Sabun & Shampo', 'sabun-shampo', 'Sabun dan shampo untuk bayi dan dewasa', true, 6);

-- ============================================
-- PRODUCTS
-- ============================================

-- Kosmetik
INSERT INTO products (id, name, slug, barcode, sku, description, price, cost_price, category_id, unit, min_stock, is_active) VALUES
  ('prod-001', 'Wardah Lightening Serum 30ml', 'wardah-lightening-serum-30ml', '8992761100101', 'WDR-LSR-30', 'Serum pencerah wajah dengan Vitamin C', 85000, 65000, 'cat-002', 'pcs', 10, true),
  ('prod-002', 'Wardah Lightening Day Cream 30g', 'wardah-lightening-day-cream-30g', '8992761100102', 'WDR-LDC-30', 'Krim siang pencerah dengan SPF 30', 75000, 55000, 'cat-002', 'pcs', 10, true),
  ('prod-003', 'Wardah Lightening Night Cream 30g', 'wardah-lightening-night-cream-30g', '8992761100103', 'WDR-LNC-30', 'Krim malam pencerah wajah', 75000, 55000, 'cat-002', 'pcs', 10, true),
  ('prod-004', 'Make Over Powerstay Foundation', 'make-over-powerstay-foundation', '8992761100201', 'MKO-PSF-01', 'Foundation tahan lama 24 jam', 189000, 145000, 'cat-001', 'pcs', 5, true),
  ('prod-005', 'Make Over Powerstay Matte Lipstick', 'make-over-powerstay-lipstick', '8992761100202', 'MKO-PSL-01', 'Lipstick matte tahan lama', 125000, 95000, 'cat-001', 'pcs', 10, true),
  ('prod-006', 'Emina Sun Battle Sunscreen SPF 45', 'emina-sun-battle-sunscreen', '8992761100301', 'EMN-SBS-45', 'Sunscreen untuk kulit remaja', 55000, 40000, 'cat-002', 'pcs', 15, true),
  ('prod-007', 'Eina Baby Face Mist', 'eina-baby-face-mist', '8992761100302', 'ENA-BFM-01', 'Face mist untuk kulit sensitif', 45000, 32000, 'cat-002', 'pcs', 15, true);

-- Susu Bayi
INSERT INTO products (id, name, slug, barcode, sku, description, price, cost_price, category_id, unit, min_stock, is_active) VALUES
  ('prod-008', 'SGM Eksplor 1+ 400g', 'sgm-eksplor-1-400g', '8992771100101', 'SGM-EX1-400', 'Susu pertumbuhan untuk anak 1-3 tahun', 55000, 48000, 'cat-003', 'pcs', 20, true),
  ('prod-009', 'SGM Eksplor 1+ 900g', 'sgm-eksplor-1-900g', '8992771100102', 'SGM-EX1-900', 'Susu pertumbuhan untuk anak 1-3 tahun', 115000, 98000, 'cat-003', 'pcs', 15, true),
  ('prod-010', 'SGM Eksplor 3+ 400g', 'sgm-eksplor-3-400g', '8992771100103', 'SGM-EX3-400', 'Susu pertumbuhan untuk anak 3-5 tahun', 58000, 50000, 'cat-003', 'pcs', 20, true),
  ('prod-011', 'SGM Eksplor 3+ 900g', 'sgm-eksplor-3-900g', '8992771100104', 'SGM-EX3-900', 'Susu pertumbuhan untuk anak 3-5 tahun', 120000, 102000, 'cat-003', 'pcs', 15, true),
  ('prod-012', 'Sustagen Junior 1+ 350g', 'sustagen-junior-1-350g', '8992771100201', 'SUS-JR1-350', 'Susu lengkap untuk anak 1-3 tahun', 72000, 60000, 'cat-003', 'pcs', 10, true),
  ('prod-013', 'Sustagen School 3+ 350g', 'sustagen-school-3-350g', '8992771100202', 'SUS-SC3-350', 'Susu untuk anak usia sekolah', 75000, 62000, 'cat-003', 'pcs', 10, true),
  ('prod-014', 'Bear Brand Susu 189ml', 'bear-brand-susu-189ml', '8992771100301', 'BBR-189', 'Susu steril untuk keluarga', 8500, 6500, 'cat-003', 'pcs', 50, true);

-- Diapers
INSERT INTO products (id, name, slug, barcode, sku, description, price, cost_price, category_id, unit, min_stock, is_active) VALUES
  ('prod-015', 'MamyPoko Standard S 10pcs', 'mamypoko-standard-s-10', '8992781100101', 'MPS-S-10', 'Popok bayi ukuran S (4-8kg)', 28000, 22000, 'cat-004', 'pcs', 30, true),
  ('prod-016', 'MamyPoko Standard M 10pcs', 'mamypoko-standard-m-10', '8992781100102', 'MPS-M-10', 'Popok bayi ukuran M (6-11kg)', 30000, 24000, 'cat-004', 'pcs', 30, true),
  ('prod-017', 'MamyPoko Standard L 10pcs', 'mamypoko-standard-l-10', '8992781100103', 'MPS-L-10', 'Popok bayi ukuran L (9-14kg)', 32000, 26000, 'cat-004', 'pcs', 30, true),
  ('prod-018', 'MamyPoko Standard XL 10pcs', 'mamypoko-standard-xl-10', '8992781100104', 'MPS-XL-10', 'Popok bayi ukuran XL (12-17kg)', 35000, 28000, 'cat-004', 'pcs', 30, true),
  ('prod-019', 'MamyPoko Pants S 14pcs', 'mamypoko-pants-s-14', '8992781100201', 'MPP-S-14', 'Popok celana ukuran S (4-8kg)', 38000, 30000, 'cat-004', 'pcs', 25, true),
  ('prod-020', 'MamyPoko Pants M 12pcs', 'mamypoko-pants-m-12', '8992781100202', 'MPP-M-12', 'Popok celana ukuran M (6-11kg)', 38000, 30000, 'cat-004', 'pcs', 25, true),
  ('prod-021', 'MamyPoko Pants L 10pcs', 'mamypoko-pants-l-10', '8992781100203', 'MPP-L-10', 'Popok celana ukuran L (9-14kg)', 38000, 30000, 'cat-004', 'pcs', 25, true),
  ('prod-022', 'MamyPoko Pants XL 8pcs', 'mamypoko-pants-xl-8', '8992781100204', 'MPP-XL-8', 'Popok celana ukuran XL (12-17kg)', 38000, 30000, 'cat-004', 'pcs', 25, true);

-- Perlengkapan Bayi
INSERT INTO products (id, name, slug, barcode, sku, description, price, cost_price, category_id, unit, min_stock, is_active) VALUES
  ('prod-023', 'Baby wipes 80pcs', 'baby-wipes-80', '8992791100101', 'BW-80', 'Tisu basah untuk bayi', 18000, 12000, 'cat-005', 'pcs', 40, true),
  ('prod-024', 'Baby Cotton Bud 100pcs', 'baby-cotton-bud-100', '8992791100201', 'BCB-100', 'Kapas bud untuk bayi', 12000, 8000, 'cat-005', 'pcs', 30, true),
  ('prod-025', 'Baby Oil 100ml', 'baby-oil-100ml', '8992791100301', 'BO-100', 'Minyak bayi untuk perawatan kulit', 15000, 10000, 'cat-005', 'pcs', 25, true),
  ('prod-026', 'Baby Powder 200g', 'baby-powder-200g', '8992791100401', 'BP-200', 'Bedak bayi', 18000, 12000, 'cat-005', 'pcs', 25, true);

-- Sabun & Shampo
INSERT INTO products (id, name, slug, barcode, sku, description, price, cost_price, category_id, unit, min_stock, is_active) VALUES
  ('prod-027', 'Johnson Baby Bath 200ml', 'johnson-baby-bath-200ml', '8992791100501', 'JBB-200', 'Sabun mandi bayi', 28000, 20000, 'cat-006', 'pcs', 20, true),
  ('prod-028', 'Johnson Baby Shampoo 200ml', 'johnson-baby-shampoo-200ml', '8992791100502', 'JBS-200', 'Shampo bayi no more tears', 30000, 22000, 'cat-006', 'pcs', 20, true),
  ('prod-029', 'Lifebuoy Sabun Mandi 80g', 'lifebuoy-sabun-mandi-80g', '8992791100601', 'LBF-80', 'Sabun mandi antibakteri', 4500, 3000, 'cat-006', 'pcs', 50, true),
  ('prod-030', 'Dove Shampoo 170ml', 'dove-shampoo-170ml', '8992791100701', 'DOV-SH-170', 'Shampo untuk rambut lembut', 25000, 18000, 'cat-006', 'pcs', 30, true);

-- ============================================
-- PRODUCT STOCKS
-- ============================================

INSERT INTO product_stocks (product_id, warehouse_id, quantity) VALUES
  -- Gudang Pusat
  ('prod-001', 'warehouse-001', 50),
  ('prod-002', 'warehouse-001', 45),
  ('prod-003', 'warehouse-001', 40),
  ('prod-004', 'warehouse-001', 25),
  ('prod-005', 'warehouse-001', 60),
  ('prod-006', 'warehouse-001', 80),
  ('prod-007', 'warehouse-001', 70),
  ('prod-008', 'warehouse-001', 100),
  ('prod-009', 'warehouse-001', 75),
  ('prod-010', 'warehouse-001', 90),
  ('prod-011', 'warehouse-001', 65),
  ('prod-012', 'warehouse-001', 55),
  ('prod-013', 'warehouse-001', 50),
  ('prod-014', 'warehouse-001', 200),
  ('prod-015', 'warehouse-001', 150),
  ('prod-016', 'warehouse-001', 150),
  ('prod-017', 'warehouse-001', 150),
  ('prod-018', 'warehouse-001', 120),
  ('prod-019', 'warehouse-001', 100),
  ('prod-020', 'warehouse-001', 100),
  ('prod-021', 'warehouse-001', 100),
  ('prod-022', 'warehouse-001', 80),
  ('prod-023', 'warehouse-001', 180),
  ('prod-024', 'warehouse-001', 150),
  ('prod-025', 'warehouse-001', 100),
  ('prod-026', 'warehouse-001', 100),
  ('prod-027', 'warehouse-001', 80),
  ('prod-028', 'warehouse-001', 80),
  ('prod-029', 'warehouse-001', 250),
  ('prod-030', 'warehouse-001', 120),
  -- Gudang Mall
  ('prod-001', 'warehouse-002', 25),
  ('prod-002', 'warehouse-002', 20),
  ('prod-003', 'warehouse-002', 20),
  ('prod-004', 'warehouse-002', 15),
  ('prod-005', 'warehouse-002', 30),
  ('prod-006', 'warehouse-002', 40),
  ('prod-007', 'warehouse-002', 35),
  ('prod-008', 'warehouse-002', 50),
  ('prod-009', 'warehouse-002', 35),
  ('prod-010', 'warehouse-002', 45),
  ('prod-011', 'warehouse-002', 30),
  ('prod-012', 'warehouse-002', 25),
  ('prod-013', 'warehouse-002', 25),
  ('prod-014', 'warehouse-002', 100),
  ('prod-015', 'warehouse-002', 75),
  ('prod-016', 'warehouse-002', 75),
  ('prod-017', 'warehouse-002', 75),
  ('prod-018', 'warehouse-002', 60),
  ('prod-019', 'warehouse-002', 50),
  ('prod-020', 'warehouse-002', 50),
  ('prod-021', 'warehouse-002', 50),
  ('prod-022', 'warehouse-002', 40),
  ('prod-023', 'warehouse-002', 90),
  ('prod-024', 'warehouse-002', 75),
  ('prod-025', 'warehouse-002', 50),
  ('prod-026', 'warehouse-002', 50),
  ('prod-027', 'warehouse-002', 40),
  ('prod-028', 'warehouse-002', 40),
  ('prod-029', 'warehouse-002', 120),
  ('prod-030', 'warehouse-002', 60);

-- ============================================
-- PROFILES (Default users - password: toko123)
-- Password hash is for 'toko123' using bcrypt
-- ============================================

-- Note: In Supabase, users are created via auth.users table
-- These are placeholder profile entries
-- Create users via Supabase Auth first, then insert profiles

-- Admin user
INSERT INTO profiles (id, email, full_name, role, branch_id, is_active) VALUES
  ('admin-001', 'admin@tokobonita.com', 'Administrator', 'admin', NULL, true);

-- Cashier users
INSERT INTO profiles (id, email, full_name, role, branch_id, is_active) VALUES
  ('cashier-001', 'kasir1@tokobonita.com', 'Siti Rahayu', 'cashier', 'branch-001', true),
  ('cashier-002', 'kasir2@tokobonita.com', 'Budi Santoso', 'cashier', 'branch-002', true);

-- ============================================
-- SETTINGS
-- ============================================

INSERT INTO settings (key, value) VALUES
  ('store_name', 'Toko Bonita'),
  ('store_tagline', 'Kecantikan & Perlengkapan Bayi'),
  ('store_address', 'Jl. Raya Serang No. 123, Tangerang'),
  ('store_phone', '021-1234567'),
  ('store_email', 'info@tokobonita.com'),
  ('tax_rate', '0'),
  ('receipt_footer', 'Terima kasih telah berbelanja di Toko Bonita!');
