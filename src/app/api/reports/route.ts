import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || searchParams.get('start_date')
    const endDate = searchParams.get('endDate') || searchParams.get('end_date')
    const paymentMethod = searchParams.get('paymentMethod') || searchParams.get('payment_method')
    const paymentStatus = searchParams.get('paymentStatus') || searchParams.get('payment_status')
    const search = searchParams.get('search')

    // Build query for transactions with items
    let query = supabase
      .from('transactions')
      .select(`
        id,
        transaction_number,
        created_at,
        subtotal_amount,
        discount_amount,
        final_amount,
        payment_method,
        payment_status,
        cash_received,
        change_amount,
        paid_at,
        cashier:profiles!transactions_cashier_id_fkey(full_name),
        branch:branches(name),
        items:transaction_items(
          qty,
          unit_price,
          final_subtotal,
          product:products(name)
        )
      `)
      .order('created_at', { ascending: false })

    // Apply date filter
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      // Add 1 day to end date to include the full day
      const end = new Date(endDate)
      end.setDate(end.getDate() + 1)
      query = query.lt('created_at', end.toISOString())
    }

    // Apply payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod)
    }

    // Apply payment status filter
    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus)
    }

    // Apply search filter
    if (search && search.trim()) {
      query = query.ilike('transaction_number', `%${search.trim()}%`)
    }

    const { data: transactions, error } = await query.limit(500)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform items to flatten product name
    const transformedTransactions = (transactions || []).map(t => ({
      ...t,
      items: (t.items || []).map((item: { qty: number; unit_price: number; final_subtotal: number; product?: { name: string } | null }) => ({
        product_name: item.product?.name || 'Produk tidak dikenal',
        qty: item.qty,
        unit_price: item.unit_price,
        final_subtotal: item.final_subtotal
      }))
    }))

    // Calculate summary statistics
    const paidTransactions = transformedTransactions.filter(t => t.payment_status === 'paid')
    
    const totalRevenue = paidTransactions.reduce((sum, t) => sum + (Number(t.final_amount) || 0), 0)
    const totalTransactions = paidTransactions.length
    const totalItems = paidTransactions.reduce((sum, t) => {
      const itemCount = (t.items || []).reduce((itemSum, item) => itemSum + (item.qty || 0), 0)
      return sum + itemCount
    }, 0)
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

    // Calculate today's stats
    const today = new Date().toISOString().split('T')[0]
    const todayTransactions = paidTransactions.filter(t => 
      t.created_at?.startsWith(today)
    )
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + (Number(t.final_amount) || 0), 0)

    // Calculate daily sales for chart (last 14 days)
    const dailySalesMap = new Map<string, { revenue: number; transactions: number }>()
    
    paidTransactions.forEach(t => {
      if (t.created_at) {
        const date = t.created_at.split('T')[0]
        const existing = dailySalesMap.get(date) || { revenue: 0, transactions: 0 }
        existing.revenue += Number(t.final_amount) || 0
        existing.transactions += 1
        dailySalesMap.set(date, existing)
      }
    })

    // Convert to array and sort by date
    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        transactions: data.transactions
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14) // Last 14 days

    return NextResponse.json({
      transactions: transformedTransactions || [],
      summary: {
        totalRevenue,
        totalTransactions,
        totalItems,
        avgTransaction,
        todayRevenue,
        todayTransactions: todayTransactions.length
      },
      dailySales
    })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
