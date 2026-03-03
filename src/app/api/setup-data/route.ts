import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results: string[] = []

  try {
    // Check and create branches
    const { data: existingBranches } = await supabase.from('branches').select('id')
    
    if (!existingBranches || existingBranches.length === 0) {
      const { data: branches, error: branchErr } = await supabase
        .from('branches')
        .insert([
          { name: 'Toko Bonita Pusat', address: 'Jl. Raya Serang No. 123, Tangerang' },
          { name: 'Toko Bonita Mall', address: 'Mall Balaraja Lt. 2 No. 45, Tangerang' }
        ])
        .select()
      
      if (branchErr) {
        results.push(`Branch error: ${branchErr.message}`)
      } else {
        results.push(`Created ${branches?.length || 0} branches`)
      }
    } else {
      results.push(`Branches exist: ${existingBranches.length}`)
    }

    // Check and create warehouses
    const { data: existingWarehouses } = await supabase.from('warehouses').select('id, branch_id')
    
    if (!existingWarehouses || existingWarehouses.length === 0) {
      const { data: branches } = await supabase.from('branches').select('id').limit(1)
      const branchId = branches?.[0]?.id
      
      const { data: warehouses, error: whErr } = await supabase
        .from('warehouses')
        .insert([
          { name: 'Gudang Pusat', branch_id: branchId },
          { name: 'Gudang Cabang', branch_id: branchId }
        ])
        .select()
      
      if (whErr) {
        results.push(`Warehouse error: ${whErr.message}`)
      } else {
        results.push(`Created ${warehouses?.length || 0} warehouses`)
      }
    } else {
      results.push(`Warehouses exist: ${existingWarehouses.length}`)
    }

    // Get products and warehouses for stock creation
    const { data: products } = await supabase.from('products').select('id')
    const { data: warehouses } = await supabase.from('warehouses').select('id')

    if (!products || products.length === 0) {
      results.push('No products found')
      return NextResponse.json({ results })
    }

    if (!warehouses || warehouses.length === 0) {
      results.push('No warehouses found - cannot create stocks')
      return NextResponse.json({ results })
    }

    // Check and create product_stocks
    const { data: existingStocks } = await supabase.from('product_stocks').select('product_id')

    if (!existingStocks || existingStocks.length === 0) {
      const stockInserts = products.map(p => ({
        product_id: p.id,
        warehouse_id: warehouses[0].id,
        stock: Math.floor(Math.random() * 50) + 10
      }))

      const { error: stockErr } = await supabase
        .from('product_stocks')
        .insert(stockInserts)

      if (stockErr) {
        results.push(`Stock error: ${stockErr.message}`)
      } else {
        results.push(`Created ${stockInserts.length} product stocks`)
      }
    } else {
      results.push(`Stocks exist: ${existingStocks.length}`)
    }

    // Get final state
    const { data: finalWh } = await supabase.from('warehouses').select('*')
    const { data: finalStocks } = await supabase.from('product_stocks').select('product_id, stock').limit(5)

    return NextResponse.json({
      success: true,
      results,
      warehouses: finalWh,
      sampleStocks: finalStocks
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      results,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
