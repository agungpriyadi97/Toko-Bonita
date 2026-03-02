import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get all transactions without transaction_number
    const { data: transactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id, created_at')
      .order('created_at', { ascending: true })

    if (fetchError) {
      return NextResponse.json({ 
        success: false, 
        error: fetchError.message,
        note: 'Pastikan kolom transaction_number sudah ditambahkan ke tabel transactions di Supabase'
      }, { status: 400 })
    }

    // Generate transaction numbers for each
    const results = []
    for (let i = 0; i < (transactions?.length || 0); i++) {
      const tx = transactions![i]
      const dateStr = new Date(tx.created_at).toISOString().slice(0, 10).replace(/-/g, '')
      const txNumber = `TXN-${dateStr}-${String(i + 1).padStart(4, '0')}`
      
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

    return NextResponse.json({ 
      success: true, 
      message: 'Transaction numbers updated',
      count: results.filter(r => r.success).length,
      results: results.slice(0, 10) // Show first 10
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
