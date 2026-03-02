import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all product stocks
  const { data: allStocks, error } = await supabase
    .from('product_stocks')
    .select('*, products(name)')

  return NextResponse.json({ 
    count: allStocks?.length, 
    data: allStocks,
    error: error?.message 
  })
}
