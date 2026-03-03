# 🛍️ Toko Bonita - Kecantikan & Perlengkapan Bayi

Aplikasi Point of Sale (POS) dan manajemen toko modern untuk Toko Bonita, dibangun dengan Next.js 15, TypeScript, TailwindCSS, dan Supabase.

## 🏪 Tentang Toko Bonita

Toko Bonita adalah toko retail yang menyediakan produk kecantikan berkualitas dan perlengkapan bayi lengkap. Aplikasi ini membantu mengelola:

- **Point of Sale (POS)** - Transaksi penjualan dengan barcode scanner
- **Multi-Cabang & Gudang** - Manajemen stok per cabang/gudang
- **Multi-Payment** - Cash, QRIS, Transfer, Debit, dan Split Payment
- **Laporan Penjualan** - Dashboard dan laporan real-time

## ✨ Fitur Utama

### 📱 Public Website
- Homepage dengan kategori produk
- Katalog produk dengan filter
- Detail produk
- Halaman tentang kami
- Halaman kontak dengan Google Maps

### 🔐 Authentication
- Login dengan Supabase Auth
- Role-based access (Admin / Kasir)
- Session management

### 💰 Kasir (POS)
- Scan barcode / SKU
- Keyboard shortcuts (F2, Ctrl+Enter, Delete)
- Keranjang belanja dengan qty +/-/remove
- Diskon item (persen/nominal)
- Diskon transaksi (persen/nominal)
- Split payment (multiple payment methods)
- Cetak struk 58mm
- Idempotency key untuk mencegah double submit

### 👨‍💼 Admin Dashboard
- Dashboard statistik
- Kelola produk
- Kelola kategori
- Kelola pengguna
- Laporan penjualan
- Kelola cabang
- Kelola gudang
- Penyesuaian stok
- Transfer stok antar gudang

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (Auth, Database, RLS)
- **UI Components**: shadcn/ui, Lucide Icons
- **State Management**: React Hooks, Zustand
- **Database**: PostgreSQL (via Supabase)

## 📁 Struktur Folder

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public pages
│   │   ├── page.tsx              # Homepage
│   │   ├── products/             # Products pages
│   │   ├── about/                # About page
│   │   └── contact/              # Contact page
│   ├── auth/login/               # Login page
│   ├── dashboard/                # Dashboard pages
│   │   ├── cashier/              # Cashier pages (POS)
│   │   └── admin/                # Admin pages
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── shared/                   # Shared components
│   └── dashboard/                # Dashboard components
├── lib/
│   ├── supabase.ts               # Server-side Supabase client
│   ├── supabase-client.ts        # Client-side Supabase client
│   └── utils.ts                  # Utility functions
├── types/
│   └── database.types.ts         # TypeScript types from Supabase
└── middleware.ts                 # Auth middleware

supabase/
├── migration.sql                 # Database migration
└── seed.sql                      # Seed data
```

## 🚀 Cara Run Lokal

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd toko-bonita

# Install dependencies
bun install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Copy URL dan anon key dari Settings > API
3. Jalankan `migration.sql` di SQL Editor
4. Jalankan `seed.sql` di SQL Editor (setelah migration)

### 3. Setup Environment

```bash
# Copy .env.example ke .env.local
cp .env.example .env.local

# Edit .env.local dengan credentials Supabase Anda
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Auth Users

Buat users di Supabase Auth:
1. Buka Authentication > Users
2. Klik "Add user" > "Create new user"
3. Buat users:
   - Admin: admin@tokobonita.com / toko123
   - Kasir: kasir1@tokobonita.com / toko123

4. Update ID di tabel `profiles` sesuai user ID dari Auth

### 5. Run Development Server

```bash
bun run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## ✅ Checklist Testing

### Barcode & Search
- [ ] Scan barcode produk (input manual)
- [ ] Cari produk dengan nama
- [ ] Cari produk dengan SKU
- [ ] Beep sound saat produk ditemukan

### Keranjang
- [ ] Tambah produk ke keranjang
- [ ] Update quantity (+/-)
- [ ] Hapus item dari keranjang
- [ ] Validasi stok (tidak bisa melebihi stok)

### Diskon
- [ ] Diskon item (persen)
- [ ] Diskon item (nominal)
- [ ] Diskon transaksi (persen)
- [ ] Diskon transaksi (nominal)

### Payment
- [ ] Pembayaran cash
- [ ] Pembayaran QRIS
- [ ] Pembayaran Transfer
- [ ] Pembayaran Debit
- [ ] Split payment (2+ metode)
- [ ] Status paid/pending

### Double Submit Prevention
- [ ] Tombol disabled saat loading
- [ ] Idempotency key baru setelah sukses
- [ ] Refresh tidak membuat transaksi duplikat

### Stok Aman
- [ ] Stok berkurang setelah transaksi
- [ ] Tidak ada stok negatif
- [ ] Stock movement tercatat

### RLS (Row Level Security)
- [ ] Public bisa lihat produk aktif
- [ ] Kasir hanya lihat transaksi miliknya
- [ ] Admin bisa lihat semua transaksi
- [ ] Admin bisa CRUD master data

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy di Vercel

1. Buka [Vercel](https://vercel.com)
2. Import project dari GitHub
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 3. Update Supabase

1. Di Supabase, tambahkan domain Vercel ke:
   - Authentication > URL Configuration > Site URL
   - Authentication > URL Configuration > Redirect URLs

## 📱 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tokobonita.com | toko123 |
| Kasir | kasir1@tokobonita.com | toko123 |

## 🗃️ Database Schema

### Tables
- `profiles` - User profiles (linked to auth.users)
- `categories` - Product categories
- `products` - Products with barcode/SKU
- `branches` - Store branches
- `warehouses` - Warehouses
- `product_stocks` - Stock per warehouse
- `transactions` - Sales transactions
- `transaction_items` - Transaction line items
- `transaction_payments` - Payment records
- `stock_movements` - Stock movement log
- `idempotency_keys` - Idempotency tracking

## 📄 License

MIT License - feel free to use for your own projects!

---

Built with ❤️ for Toko Bonita
