import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results: Record<string, unknown> = {}

  try {
    // Get products count
    const { data: products, error: pErr, count: pCount } = await supabase
      .from('products')
      .select('id, name, price, barcode, sku', { count: 'exact' })
      .limit(5)
    
    results.products = products || []
    results.productsCount = pCount
    results.productsError = pErr?.message

    // Get warehouses
    const { data: warehouses, error: wErr } = await supabase
      .from('warehouses')
      .select('id, name')
    
    results.warehouses = warehouses || []
    results.warehousesError = wErr?.message

    // Get product_stocks
    const { data: stocks, error: sErr } = await supabase
      .from('product_stocks')
      .select('*')
      .limit(5)
    
    results.stocks = stocks || []
    results.stocksError = sErr?.message

    // Check stock_movements table
    const { data: movements, error: mErr } = await supabase
      .from('stock_movements')
      .select('*')
      .limit(5)
    
    results.movements = movements || []
    results.movementsError = mErr?.message

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
