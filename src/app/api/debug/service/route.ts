import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This API helps diagnose RLS issues
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results: Record<string, unknown> = {}

  try {
    // Check warehouses with service role
    const { data: warehouses, error: whErr } = await supabase
      .from('warehouses')
      .select('*')
    results.warehouses_service_role = { count: warehouses?.length, data: warehouses, error: whErr?.message }

    // Check product_stocks with service role
    const { data: stocks, error: stErr } = await supabase
      .from('product_stocks')
      .select('*')
      .limit(10)
    results.product_stocks_service_role = { count: stocks?.length, sample: stocks, error: stErr?.message }

    // Check products count
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    results.products_count = productCount
  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error'
  }

  // RLS Policy recommendations
  results.rls_policies = {
    warehouses: [
      "CREATE POLICY \"Allow public read access\" ON warehouses FOR SELECT USING (true);",
      "CREATE POLICY \"Allow authenticated write\" ON warehouses FOR ALL TO authenticated USING (true);"
    ],
    product_stocks: [
      "CREATE POLICY \"Allow authenticated read\" ON product_stocks FOR SELECT TO authenticated USING (true);",
      "CREATE POLICY \"Allow authenticated write\" ON product_stocks FOR ALL TO authenticated USING (true);"
    ]
  }

  return NextResponse.json(results)
}
