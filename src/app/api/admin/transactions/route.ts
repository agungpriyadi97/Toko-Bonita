import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get('id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // If requesting a specific transaction by ID
    if (transactionId) {
      const { data: transaction, error } = await supabase
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
          notes,
          cashier:profiles!transactions_cashier_id_fkey(full_name),
          branch:branches(name),
          items:transaction_items(
            qty,
            unit_price,
            subtotal,
            final_subtotal,
            product:products(name)
          )
        `)
        .eq('id', transactionId)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Transform items to flatten product name
      const transformedTransaction = {
        ...transaction,
        items: (transaction?.items || []).map((item: { qty: number; unit_price: number; subtotal: number; final_subtotal: number; product?: { name: string } | null }) => ({
          product_name: item.product?.name || 'Produk tidak dikenal',
          qty: item.qty,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          final_subtotal: item.final_subtotal
        }))
      }

      return NextResponse.json({ transaction: transformedTransaction })
    }

    // Build query for all transactions
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
        notes,
        cashier:profiles!transactions_cashier_id_fkey(full_name),
        branch:branches(name),
        items:transaction_items(
          qty,
          unit_price,
          subtotal,
          final_subtotal,
          product:products(name)
        )
      `)
      .order('created_at', { ascending: false })

    // Apply date filters
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setDate(end.getDate() + 1)
      query = query.lt('created_at', end.toISOString())
    }

    const { data: transactions, error } = await query.limit(200)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform items to flatten product name
    const transformedTransactions = (transactions || []).map(t => ({
      ...t,
      items: (t.items || []).map((item: { qty: number; unit_price: number; subtotal: number; final_subtotal: number; product?: { name: string } | null }) => ({
        product_name: item.product?.name || 'Produk tidak dikenal',
        qty: item.qty,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
        final_subtotal: item.final_subtotal
      }))
    }))

    return NextResponse.json({ transactions: transformedTransactions })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
