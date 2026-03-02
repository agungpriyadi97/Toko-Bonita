import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Check if columns already exist by trying to select them
    const { error: checkError } = await supabase
      .from('orders')
      .select('shipping_method, shipping_cost')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({ 
        success: true, 
        message: 'Kolom shipping_method dan shipping_cost sudah ada di tabel orders',
        columnsExist: true
      })
    }

    // If columns don't exist, provide SQL instructions
    return NextResponse.json({ 
      success: false, 
      columnsExist: false,
      message: 'Kolom shipping_method dan shipping_cost belum ada. Silakan tambahkan kolom berikut di Supabase Dashboard > SQL Editor:',
      sql: `
-- Jalankan SQL berikut di Supabase SQL Editor:

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_method TEXT DEFAULT 'pickup',
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;

-- Update existing orders to have default values
UPDATE orders 
SET shipping_method = 'pickup', shipping_cost = 0 
WHERE shipping_method IS NULL;
      `.trim(),
      instructions: [
        '1. Buka Supabase Dashboard',
        '2. Pilih project Anda',
        '3. Klik SQL Editor di menu kiri',
        '4. Copy dan paste SQL di atas',
        '5. Klik Run untuk menjalankan'
      ]
    })
  } catch (error) {
    console.error('Migration check error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
