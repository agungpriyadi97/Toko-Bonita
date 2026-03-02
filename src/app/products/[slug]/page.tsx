import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Phone, MapPin, Clock, MessageCircle } from 'lucide-react'
import { ProductPurchaseDialog } from './product-purchase-dialog'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-4 md:py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb - simplified on mobile */}
          <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <Link href="/" className="hover:text-pink-600">Beranda</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-pink-600">Produk</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link 
                  href={`/products?category=${product.category.slug}`} 
                  className="hover:text-pink-600"
                >
                  {product.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900">{product.name}</span>
          </nav>

          {/* Mobile back button */}
          <div className="md:hidden mb-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Produk
              </Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0 md:gap-8">
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="h-32 w-32 text-pink-300" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-4 md:p-8">
                <div className="mb-3 md:mb-4">
                  {product.category && (
                    <Badge className="bg-pink-100 text-pink-700 mb-2 md:mb-4 text-xs md:text-sm">
                      {product.category.name}
                    </Badge>
                  )}
                  <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
                    {product.name}
                  </h1>
                  {(product.barcode || product.sku) && (
                    <p className="text-xs md:text-sm text-gray-500">
                      {product.sku && `SKU: ${product.sku}`}
                      {product.sku && product.barcode && ' | '}
                      {product.barcode && `Barcode: ${product.barcode}`}
                    </p>
                  )}
                </div>

                <div className="mb-4 md:mb-6">
                  <p className="text-2xl md:text-3xl font-bold text-pink-600">
                    {formatPrice(product.price)}
                  </p>
                  {product.cost_price && product.cost_price > 0 && (
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      Harga modal: {formatPrice(product.cost_price)}
                    </p>
                  )}
                </div>

                {product.description && (
                  <div className="mb-4 md:mb-6">
                    <h3 className="font-semibold text-gray-900 mb-1 md:mb-2 text-sm md:text-base">Deskripsi</h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6">
                  <div className="bg-gray-50 rounded-lg p-2 md:p-4">
                    <p className="text-xs text-gray-500">Satuan</p>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">{product.unit}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2 md:p-4">
                    <p className="text-xs text-gray-500">Stok Minimum</p>
                    <p className="font-semibold text-gray-900 text-sm md:text-base">{product.min_stock} {product.unit}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                  <Button asChild variant="outline" className="hidden md:flex">
                    <Link href="/products">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Kembali
                    </Link>
                  </Button>
                  <div className="flex-1 md:flex-none">
                    <ProductPurchaseDialog product={product} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
