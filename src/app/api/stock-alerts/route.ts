import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Service role client for admin operations
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threshold = parseInt(searchParams.get('threshold') || '5')
    const warehouseId = searchParams.get('warehouse_id')

    // Query products with their stock
    let stockQuery = supabase
      .from('product_stocks')
      .select(`
        stock,
        product:products (
          id,
          name,
          sku,
          barcode,
          image_url,
          category:categories (name)
        ),
        warehouse:warehouses (id, name, branch_id)
      `)
      .lt('stock', threshold)
      .gt('stock', 0)

    if (warehouseId) {
      stockQuery = stockQuery.eq('warehouse_id', warehouseId)
    }

    const { data: stockData, error: stockError } = await stockQuery

    if (stockError) {
      return NextResponse.json({ error: stockError.message }, { status: 500 })
    }

    // Also get products with zero stock (out of stock)
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, sku, barcode, image_url, category:categories (name)')
      .eq('is_active', true)

    const { data: allStocks } = await supabase
      .from('product_stocks')
      .select('product_id, stock, warehouse_id')

    // Find products with no stock records or 0 total stock
    const stockMap = new Map<string, number>()
    if (allStocks) {
      allStocks.forEach(s => {
        const current = stockMap.get(s.product_id) || 0
        stockMap.set(s.product_id, current + (s.stock || 0))
      })
    }

    const outOfStockProducts = (allProducts || []).filter(p => {
      const totalStock = stockMap.get(p.id) || 0
      return totalStock === 0
    })

    // Format low stock items
    const lowStockItems = (stockData || []).map((item: any) => ({
      product_id: item.product?.id,
      product_name: item.product?.name,
      product_sku: item.product?.sku,
      product_barcode: item.product?.barcode,
      image_url: item.product?.image_url,
      category_name: item.product?.category?.name,
      stock: item.stock,
      warehouse_id: item.warehouse?.id,
      warehouse_name: item.warehouse?.name,
      status: 'low_stock' as const
    }))

    // Format out of stock items
    const outOfStockItems = outOfStockProducts.map((product: any) => ({
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      product_barcode: product.barcode,
      image_url: product.image_url,
      category_name: product.category?.name,
      stock: 0,
      warehouse_id: null,
      warehouse_name: null,
      status: 'out_of_stock' as const
    }))

    return NextResponse.json({
      low_stock: lowStockItems,
      out_of_stock: outOfStockItems,
      total_alerts: lowStockItems.length + outOfStockItems.length,
      threshold
    })
  } catch (error) {
    console.error('Error fetching stock alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create notifications for low stock products
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service role not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { threshold = 5, create_notifications = true } = body

    // Get low stock products
    const { data: lowStockProducts } = await supabaseAdmin
      .from('product_stocks')
      .select(`
        stock,
        product_id,
        product:products (name)
      `)
      .lt('stock', threshold)
      .gt('stock', 0)

    // Get out of stock products
    const { data: allProducts } = await supabaseAdmin
      .from('products')
      .select('id, name')
      .eq('is_active', true)

    const { data: allStocks } = await supabaseAdmin
      .from('product_stocks')
      .select('product_id, stock')

    const stockMap = new Map<string, number>()
    if (allStocks) {
      allStocks.forEach(s => {
        const current = stockMap.get(s.product_id) || 0
        stockMap.set(s.product_id, current + (s.stock || 0))
      })
    }

    const outOfStockProducts = (allProducts || []).filter((p: any) => {
      const totalStock = stockMap.get(p.id) || 0
      return totalStock === 0
    })

    const notificationsCreated = []

    if (create_notifications) {
      // Create low stock notifications
      for (const item of (lowStockProducts || [])) {
        const existingNotification = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('type', 'low_stock')
          .eq('data->product_id', item.product_id)
          .eq('is_read', false)
          .maybeSingle()

        if (!existingNotification.data) {
          const { data: notification } = await supabaseAdmin
            .from('notifications')
            .insert({
              type: 'low_stock',
              title: 'Stok Menipis',
              message: `${(item.product as any)?.name} tersisa ${item.stock} unit`,
              data: {
                product_id: item.product_id,
                stock: item.stock,
                threshold
              }
            })
            .select()
            .single()
          
          if (notification) {
            notificationsCreated.push(notification)
          }
        }
      }

      // Create out of stock notifications
      for (const product of outOfStockProducts) {
        const existingNotification = await supabaseAdmin
          .from('notifications')
          .select('id')
          .eq('type', 'low_stock')
          .eq('data->product_id', product.id)
          .eq('is_read', false)
          .maybeSingle()

        if (!existingNotification.data) {
          const { data: notification } = await supabaseAdmin
            .from('notifications')
            .insert({
              type: 'low_stock',
              title: 'Stok Habis',
              message: `${product.name} sudah habis!`,
              data: {
                product_id: product.id,
                stock: 0,
                threshold,
                out_of_stock: true
              }
            })
            .select()
            .single()
          
          if (notification) {
            notificationsCreated.push(notification)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      low_stock_count: lowStockProducts?.length || 0,
      out_of_stock_count: outOfStockProducts.length,
      notifications_created: notificationsCreated.length
    })
  } catch (error) {
    console.error('Error creating stock alerts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
