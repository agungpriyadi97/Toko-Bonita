import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Seed sample notifications for testing
export async function GET() {
  try {
    const sampleNotifications = [
      {
        type: 'new_order',
        title: 'Pesanan Baru',
        message: 'Pesanan baru senilai Rp 125.000 telah masuk',
        data: { order_id: 'test-001' },
        is_read: false
      },
      {
        type: 'transaction_completed',
        title: 'Transaksi Selesai',
        message: 'Transaksi Rp 250.000 telah berhasil diproses',
        data: { transaction_id: 'test-002' },
        is_read: false
      },
      {
        type: 'low_stock',
        title: 'Stok Menipis',
        message: 'Stok produk "Diapers NB 36pcs" hampir habis (sisa 5 pcs)',
        data: { product_id: 'test-003' },
        is_read: false
      },
      {
        type: 'system',
        title: 'Pembaruan Sistem',
        message: 'Sistem telah diperbarui ke versi terbaru',
        data: {},
        is_read: true
      }
    ]

    const { data, error } = await supabase
      .from('notifications')
      .insert(sampleNotifications)
      .select()

    if (error) {
      // If table doesn't exist, return mock success
      if (error.code === '42P01') {
        return NextResponse.json({ 
          success: true, 
          message: 'Notifications table does not exist. Run the migration first.',
          sampleNotifications 
        })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sample notifications created',
      data 
    })
  } catch (error) {
    console.error('Error seeding notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
