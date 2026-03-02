import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get all products
  const { data: products, error: productsErr } = await supabase
    .from('products')
    .select('id, name')

  if (productsErr) {
    return NextResponse.json({ error: productsErr.message }, { status: 500 })
  }

  // Get warehouse
  const { data: warehouses, error: warehousesErr } = await supabase
    .from('warehouses')
    .select('id')

  if (warehousesErr || !warehouses || warehouses.length === 0) {
    return NextResponse.json({ error: 'No warehouse found' }, { status: 500 })
  }

  const warehouseId = warehouses[0].id

  // Get existing stocks
  const { data: existingStocks } = await supabase
    .from('product_stocks')
    .select('product_id')

  const existingProductIds = new Set(existingStocks?.map(s => s.product_id) || [])

  // Create stock entries for products without stock
  const newStocks = products
    ?.filter(p => !existingProductIds.has(p.id))
    .map(p => ({
      product_id: p.id,
      warehouse_id: warehouseId,
      stock: Math.floor(Math.random() * 50) + 10 // Random stock 10-60
    })) || []

  if (newStocks.length === 0) {
    return NextResponse.json({ 
      message: 'All products already have stock',
      totalProducts: products?.length,
      productsWithStock: existingProductIds.size
    })
  }

  // Insert new stocks
  const { error: insertErr } = await supabase
    .from('product_stocks')
    .insert(newStocks)

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({ 
    message: 'Stock seeded successfully',
    addedStocks: newStocks.length,
    totalProducts: products?.length
  })
}
