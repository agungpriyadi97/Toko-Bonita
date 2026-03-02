import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { createClient } from '@/lib/supabase'
import { ProductsClient } from './products-client'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  // Fetch products with filters
  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_active', true)
    .order('name')

  if (params.category) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    
    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    }
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,barcode.ilike.%${params.search}%,sku.ilike.%${params.search}%`)
  }

  const { data: products } = await query

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Produk Kami
            </h1>
            <p className="text-gray-600">
              Temukan berbagai produk kecantikan dan perlengkapan bayi berkualitas
            </p>
          </div>

          <ProductsClient 
            products={products || []} 
            categories={categories || []}
            currentCategory={params.category}
            currentSearch={params.search}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
