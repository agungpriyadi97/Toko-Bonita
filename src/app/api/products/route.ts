import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'newest'

    let query = supabase
      .from('products')
      .select('id, name, slug, price, image_url, barcode, sku, category:categories(id, name, slug)')
      .eq('is_active', true)

    // Search filter
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // Category filter
    if (category && category !== 'all') {
      // First get the category ID from slug
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }

    // Sorting
    switch (sortBy) {
      case 'name_asc':
        query = query.order('name', { ascending: true })
        break
      case 'name_desc':
        query = query.order('name', { ascending: false })
        break
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to match the expected format
    const products = (data || []).map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.image_url,
      barcode: product.barcode,
      sku: product.sku,
      category: product.category
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
