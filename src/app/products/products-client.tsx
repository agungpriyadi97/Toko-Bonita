'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { Search, Package, ShoppingCart, Filter } from 'lucide-react'
import type { Tables } from '@/types/database.types'

type Product = Tables<'products'> & {
  category: Tables<'categories'> | null
}

type Category = Tables<'categories'>

interface ProductsClientProps {
  products: Product[]
  categories: Category[]
  currentCategory?: string
  currentSearch?: string
}

// Category images mapping
const categoryImages: Record<string, string> = {
  'kosmetik': '/images/category-kosmetik.png',
  'skincare': '/images/category-skincare.png',
  'susu-bayi': '/images/category-susu-bayi.png',
  'diapers': '/images/category-diapers.png',
  'perlengkapan-mandi-bayi': '/images/category-baby-care.png',
  'perlengkapan-makan-bayi': '/images/category-baby-care.png',
}

// Product placeholder images by category
const getProductImage = (product: Product) => {
  if (product.image_url) return product.image_url
  
  const categorySlug = product.category?.slug
  if (categorySlug && categoryImages[categorySlug]) {
    return categoryImages[categorySlug]
  }
  
  return '/images/hero-products.png'
}

export function ProductsClient({ 
  products, 
  categories, 
  currentCategory,
  currentSearch 
}: ProductsClientProps) {
  const [search, setSearch] = useState(currentSearch || '')

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (currentCategory) params.set('category', currentCategory)
    if (search) params.set('search', search)
    window.location.href = `/products?${params.toString()}`
  }

  const handleCategoryChange = (value: string) => {
    if (value === 'all') {
      window.location.href = '/products'
    } else {
      window.location.href = `/products?category=${value}`
    }
  }

  const currentCategoryData = categories.find(c => c.slug === currentCategory)

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
      {/* Mobile Category Filter */}
      <div className="md:hidden">
        <Select value={currentCategory || 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Produk</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <Card className="sticky top-20 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4">
            <h3 className="font-semibold text-white">Kategori</h3>
          </div>
          <CardContent className="p-0">
            <nav className="divide-y">
              <Link
                href="/products"
                className={`block px-4 py-3 text-sm transition-colors ${
                  !currentCategory
                    ? 'bg-pink-50 text-pink-700 font-medium border-l-4 border-pink-500'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Semua Produk
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className={`block px-4 py-3 text-sm transition-colors ${
                    currentCategory === category.slug
                      ? 'bg-pink-50 text-pink-700 font-medium border-l-4 border-pink-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Search */}
        <form onSubmit={handleSearch} className="mb-4 md:mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-16 md:pr-20 h-10 md:h-12 text-sm md:text-base"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            <Button type="submit" size="sm" className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 h-7 md:h-9 text-xs md:text-sm">
              Cari
            </Button>
          </div>
        </form>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <p className="text-gray-600 text-sm md:text-base">
            {currentCategoryData ? (
              <>Kategori: <span className="font-medium text-gray-900">{currentCategoryData.name}</span></>
            ) : (
              'Semua Produk'
            )}
            <span className="ml-2">({products.length})</span>
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.category && (
                      <Badge className="absolute top-2 left-2 bg-white/90 text-pink-600 text-[10px] md:text-xs">
                        {product.category.name}
                      </Badge>
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                        <Badge variant="destructive" className="text-xs md:text-sm">Habis</Badge>
                      </div>
                    )}
                    <div className="hidden md:block absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">{product.name}</p>
                    </div>
                  </div>
                  <CardContent className="p-2 md:p-3">
                    <h3 className="font-medium text-gray-900 mb-0.5 md:mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors text-xs md:text-sm">
                      {product.name}
                    </h3>
                    {(product.barcode || product.sku) && (
                      <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1 hidden md:block">
                        {product.sku && `SKU: ${product.sku}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm md:text-base font-bold text-pink-600">
                        {formatPrice(product.price)}
                      </p>
                      {product.in_stock ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 text-[10px] md:text-xs hidden sm:flex">
                          Tersedia
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-200 text-[10px] md:text-xs hidden sm:flex">
                          Habis
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 md:h-16 md:w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-sm md:text-base">Tidak ada produk ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}
