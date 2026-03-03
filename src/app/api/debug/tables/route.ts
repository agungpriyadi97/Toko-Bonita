import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results: Record<string, unknown> = {}

  // Test warehouses
  const { data: wh, error: whErr } = await supabase.from('warehouses').select('*')
  results.warehouses = { count: wh?.length, data: wh, error: whErr?.message }

  // Test branches
  const { data: br, error: brErr } = await supabase.from('branches').select('*')
  results.branches = { count: br?.length, data: br, error: brErr?.message }

  // Test product_stocks
  const { data: ps, error: psErr } = await supabase.from('product_stocks').select('*').limit(5)
  results.product_stocks = { count: ps?.length, sample: ps, error: psErr?.message }

  return NextResponse.json(results, null, 2)
}
