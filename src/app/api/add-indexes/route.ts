import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Note: We can't run DDL via RPC easily, so we'll return instructions
    // But we can check if the tables exist and have data

    const { count: ordersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    const { count: itemsCount } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({ 
      success: true, 
      message: 'Database status',
      stats: {
        orders: ordersCount || 0,
        order_items: itemsCount || 0
      },
      note: 'To add indexes for better performance, please run the SQL in /supabase/add-indexes.sql manually in Supabase Dashboard > SQL Editor'
    })
  } catch (error) {
    console.error('Error checking database:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Could not check database status'
    }, { status: 500 })
  }
}
