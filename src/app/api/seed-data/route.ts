import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const results: string[] = []

  try {
    // Check existing warehouses
    const { data: existingWh } = await supabase.from('warehouses').select('id')
    
    let warehouseId: string

    if (!existingWh || existingWh.length === 0) {
      // Create branch first
      const { data: branch, error: branchErr } = await supabase
        .from('branches')
        .insert({ name: 'Cabang Utama', address: 'Jl. Raya Utama No. 1' })
        .select('id')
        .single()

      if (branchErr) {
        results.push(`Branch error: ${branchErr.message}`)
      } else if (branch) {
        // Create warehouse
        const { data: warehouse, error: whErr } = await supabase
          .from('warehouses')
          .insert({ name: 'Gudang Utama', branch_id: branch.id })
          .select('id')
          .single()

        if (whErr) {
          results.push(`Warehouse error: ${whErr.message}`)
        } else if (warehouse) {
          warehouseId = warehouse.id
          results.push(`Created warehouse: ${warehouse.name}`)
        }
      }
    } else {
      warehouseId = existingWh[0].id
      results.push(`Warehouse exists: ${existingWh.length}`)
    }

    // Get products
    const { data: products } = await supabase
      .from('products')
      .select('id')

    if (!products || products.length === 0) {
      results.push('No products found')
      return NextResponse.json({ results })
    }

    // Check existing stocks
    const { data: existingStocks } = await supabase
      .from('product_stocks')
      .select('product_id')

    if (!existingStocks || existingStocks.length === 0) {
      // Create stocks for each product
      const stockData = products.map(p => ({
        product_id: p.id,
        warehouse_id: warehouseId,
        stock: Math.floor(Math.random() * 50) + 10
      }))

      const { error: stockErr } = await supabase
        .from('product_stocks')
        .insert(stockData)

      if (stockErr) {
        results.push(`Stock insert error: ${stockErr.message}`)
      } else {
        results.push(`Created ${stockData.length} product stocks`)
      }
    } else {
      results.push(`Stocks exist: ${existingStocks.length}`)
    }

    // Verify final state
    const { data: finalWarehouses } = await supabase.from('warehouses').select('id, name')
    const { data: finalStocks } = await supabase.from('product_stocks').select('product_id, stock').limit(5)

    return NextResponse.json({
      success: true,
      results,
      warehouses: finalWarehouses,
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
