-- ============================================
-- SQL SEDERHANA - Jalankan satu per satu di Supabase SQL Editor
-- ============================================

-- STEP 1: Tambah kolom transaction_number ke transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_number TEXT;

-- STEP 2: Tambah kolom payment_proof ke orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof TEXT;

-- STEP 3: Update transaksi lama dengan nomor transaksi (jalankan jika sudah ada transaksi)
UPDATE transactions 
SET transaction_number = 'TXN-' || to_char(created_at, 'YYYYMMDD') || '-' || lpad(split_part(id::text, '-', 1), 4, '0')
WHERE transaction_number IS NULL;

-- STEP 4: Buat index (opsional)
CREATE INDEX IF NOT EXISTS idx_transactions_tn ON transactions(transaction_number);

-- ============================================
-- SELESAI! Refresh halaman transaksi setelah ini
-- ============================================
