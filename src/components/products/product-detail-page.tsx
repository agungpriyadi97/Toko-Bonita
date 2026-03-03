'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart, 
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Package
} from 'lucide-react'
import { Breadcrumb } from '@/components/shared'

const categoryImages: Record<string, string> = {
  'kosmetik': '/images/category-kosmetik.png',
  'skincare': '/images/category-skincare.png',
  'susu-bayi': '/images/category-susu-bayi.png',
  'diapers': '/images/category-diapers.png',
  'perlengkapan-bayi': '/images/category-baby-care.png',
  'sabun-shampo': '/images/category-baby-care.png',
}

interface Product {
  id: string
  name: string
  slug: string
  barcode: string | null
  sku: string | null
  description: string | null
  price: number
  costPrice: number | null
  unit: string
  minStock: number
  category: {
    id: string
    name: string
    slug: string
  } | null
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/products/${slug}`)
        if (!response.ok) {
          throw new Error('Produk tidak ditemukan')
        }
        const data = await response.json()
        setProduct(data.product)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-6 w-48 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'Produk tidak ditemukan'}</p>
          <Link href="/products">
            <Button>Kembali ke Produk</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb 
          items={[
            { label: 'Produk', href: '/products' },
            ...(product.category ? [{ label: product.category.name, href: `/products?category=${product.category.slug}` }] : []),
            { label: product.name }
          ]} 
        />

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 relative">
                  <img
                    src={product.category?.slug ? categoryImages[product.category.slug] : '/images/hero-products.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Link 
                  href={`/products?category=${product.category.slug}`}
                  className="text-sm text-rose-600 hover:text-rose-700 mb-2 inline-block"
                >
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-rose-600">
                  {formatPrice(product.price)}
                </span>
                <span className="text-gray-500">/ {product.unit}</span>
              </div>
            </div>

            {/* Product Codes */}
            <div className="flex flex-wrap gap-2">
              {product.barcode && (
                <Badge variant="outline" className="text-xs">
                  Barcode: {product.barcode}
                </Badge>
              )}
              {product.sku && (
                <Badge variant="outline" className="text-xs">
                  SKU: {product.sku}
                </Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Deskripsi</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <Separator />

            {/* Quantity Selector */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Jumlah</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-gray-500">
                  Total: <span className="font-bold text-gray-900">{formatPrice(product.price * quantity)}</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                onClick={() => {
                  // Open WhatsApp with order details
                  const message = `Halo, saya ingin memesan:\n\n*${product.name}*\nQty: ${quantity}\nHarga: ${formatPrice(product.price)}/pcs\nTotal: ${formatPrice(product.price * quantity)}\n\nMohon konfirmasi ketersediaan. Terima kasih!`
                  const encodedMessage = encodeURIComponent(message)
                  window.open(`https://wa.me/6281234567890?text=${encodedMessage}`, '_blank')
                }}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Beli Sekarang
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5 mr-2" />
                Simpan
              </Button>
              <Button size="lg" variant="ghost">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Truck className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pengiriman Cepat</p>
                  <p className="text-xs text-gray-500">Sampai di hari yang sama</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Shield className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Produk Original</p>
                  <p className="text-xs text-gray-500">Dijamin 100% asli</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <RotateCcw className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Pengembalian</p>
                  <p className="text-xs text-gray-500">7 hari pengembalian</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-lg">
                  <Package className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Stok Tersedia</p>
                  <p className="text-xs text-gray-500">Siap dikirim</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
