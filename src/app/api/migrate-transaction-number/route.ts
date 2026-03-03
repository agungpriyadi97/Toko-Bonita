import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST() {
  try {
    // Step 1: Get all transactions
    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id, created_at')
      .order('created_at', { ascending: true })

    if (fetchError) {
      return NextResponse.json({ 
        success: false, 
        step: 'fetch_transactions',
        error: fetchError.message 
      }, { status: 400 })
    }

    // Step 2: Try to update each transaction with a number
    const dateGroups: Record<string, number> = {}
    const results = []

    for (const tx of (transactions || [])) {
      const dateKey = new Date(tx.created_at).toISOString().slice(0, 10)
      dateGroups[dateKey] = (dateGroups[dateKey] || 0) + 1
      
      const dateStr = dateKey.replace(/-/g, '')
      const txNumber = `TXN-${dateStr}-${String(dateGroups[dateKey]).padStart(4, '0')}`
      
      // Try to update - will fail if column doesn't exist
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ transaction_number: txNumber })
        .eq('id', tx.id)
      
      results.push({
        id: tx.id,
        transaction_number: txNumber,
        success: !updateError,
        error: updateError?.message
      })
    }

    const successCount = results.filter(r => r.success).length
    
    return NextResponse.json({
      success: successCount > 0,
      message: successCount > 0 
        ? `Berhasil update ${successCount} transaksi dengan nomor transaksi`
        : 'Kolom transaction_number belum ada. Jalankan SQL di bawah.',
      transactions_count: transactions?.length || 0,
      updated_count: successCount,
      sample_results: results.slice(0, 5),
      sql_to_run: `
-- Jalankan di Supabase SQL Editor:

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_number TEXT;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof TEXT;

-- Setelah itu, akses /api/migrate-transaction-number lagi untuk update nomor transaksi
`
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
