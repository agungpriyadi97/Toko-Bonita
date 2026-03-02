import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        cost_price,
        barcode,
        sku,
        description,
        unit,
        min_stock,
        image_url,
        category:categories(id, name, slug)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
