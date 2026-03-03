import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Category name to image mapping
const categoryImageMap: Record<string, string> = {
  'Kosmetik': '/images/products/kosmetik.png',
  'Skincare': '/images/products/skincare-serum.png',
  'Susu Bayi': '/images/products/susu-bayi.png',
  'Diapers': '/images/products/diapers.png',
  'Perlengkapan Bayi': '/images/products/perlengkapan-bayi.png',
  'Sabun & Shampo': '/images/products/sabun-shampo.png',
  // Additional categories from database
  'Perlengkapan Mandi Bayi': '/images/products/sabun-shampo.png',
  'Perlengkapan Makan Bayi': '/images/products/perlengkapan-bayi.png',
}

export async function GET() {
  try {
    // Get all products with their categories
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, category_id, category:categories(name)')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const results = []

    // Update each product with the appropriate image
    for (const product of products || []) {
      const categoryName = (product.category as { name: string } | null)?.name
      const imageUrl = categoryName ? categoryImageMap[categoryName] : null
      
      if (imageUrl) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: imageUrl })
          .eq('id', product.id)

        results.push({
          id: product.id,
          name: product.name,
          category: categoryName,
          image_url: imageUrl,
          success: !updateError,
          error: updateError?.message
        })
      } else {
        results.push({
          id: product.id,
          name: product.name,
          category: categoryName,
          image_url: null,
          success: false,
          error: 'No matching image for category'
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      updated: results.filter(r => r.success).length,
      total: results.length,
      products: results 
    })
  } catch (error) {
    console.error('Error updating product images:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
