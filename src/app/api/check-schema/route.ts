import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get sample transaction to see columns
    const { data: txSample, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1)
    
    // Get sample order to see columns  
    const { data: orderSample, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)

    // Check if transaction_number exists
    const hasTransactionNumber = txSample?.[0] ? 'transaction_number' in txSample[0] : false
    const hasPaymentProof = orderSample?.[0] ? 'payment_proof' in orderSample[0] : false

    return NextResponse.json({
      transactions: {
        columns: txSample?.[0] ? Object.keys(txSample[0]) : [],
        sample: txSample?.[0] || null,
        has_transaction_number: hasTransactionNumber
      },
      orders: {
        columns: orderSample?.[0] ? Object.keys(orderSample[0]) : [],
        sample: orderSample?.[0] || null,
        has_payment_proof: hasPaymentProof
      },
      needs_migration: !hasTransactionNumber || !hasPaymentProof,
      migration_sql: !hasTransactionNumber || !hasPaymentProof ? `
-- Jalankan di Supabase SQL Editor:

${!hasTransactionNumber ? `ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transaction_number TEXT;` : ''}

${!hasPaymentProof ? `ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof TEXT;` : ''}

-- Update existing transactions with numbers:
UPDATE transactions SET transaction_number = 'TXN-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || LPAD(id::TEXT, 4, '0') WHERE transaction_number IS NULL;
` : 'All columns exist!'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
