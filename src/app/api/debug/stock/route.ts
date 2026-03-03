import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Check tables existence
  const results: Record<string, unknown> = {}

  // Check branches
  const { data: branches, error: branchesErr } = await supabase
    .from('branches')
    .select('*')
  results.branches = branchesErr ? { error: branchesErr.message } : { count: branches?.length, data: branches }

  // Check warehouses
  const { data: warehouses, error: warehousesErr } = await supabase
    .from('warehouses')
    .select('*')
  results.warehouses = warehousesErr ? { error: warehousesErr.message } : { count: warehouses?.length, data: warehouses }

  // Check products
  const { data: products, error: productsErr } = await supabase
    .from('products')
    .select('id, name')
    .limit(5)
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
  results.products = productsErr ? { error: productsErr.message } : { count: productCount, sample: products }

  // Check product_stocks
  const { data: stocks, error: stocksErr } = await supabase
    .from('product_stocks')
    .select('*')
    .limit(5)
  results.product_stocks = stocksErr ? { error: stocksErr.message } : { count: stocks?.length, sample: stocks }

  // Check stock_movements
  const { data: movements, error: movementsErr } = await supabase
    .from('stock_movements')
    .select('*')
    .limit(5)
  results.stock_movements = movementsErr ? { error: movementsErr.message } : { sample: movements }

  return NextResponse.json(results, { status: 200 })
}
