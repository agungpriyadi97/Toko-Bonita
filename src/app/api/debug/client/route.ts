import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, anonKey)

  const results: Record<string, unknown> = {}

  // Test warehouses
  try {
    const { data, error } = await supabase.from('warehouses').select('*')
    results.warehouses = { data, error: error?.message }
  } catch {
    results.warehouses = { error: 'Failed to query' }
  }

  // Test product_stocks
  try {
    const { data, error } = await supabase.from('product_stocks').select('*').limit(3)
    results.product_stocks = { data, error: error?.message }
  } catch {
    results.product_stocks = { error: 'Failed to query' }
  }

  // Test products count
  try {
    const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true })
    results.products_count = { count, error: error?.message }
  } catch {
    results.products_count = { error: 'Failed to count' }
  }

  return NextResponse.json(results)
}
