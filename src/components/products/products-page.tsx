'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Breadcrumb } from '@/components/shared'

const categoryImages: Record<string, string> = {
  'kosmetik': '/images/category-kosmetik.png',
  'skincare': '/images/category-skincare.png',
  'susu-bayi': '/images/category-susu-bayi.png',
  'diapers': '/images/category-diapers.png',
  'perlengkapan-bayi': '/images/category-baby-care.png',
  'sabun-shampo': '/images/category-baby-care.png',
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  imageUrl: string | null
  category: Category | null
  barcode: string | null
  sku: string | null
}

const sortOptions = [
  { value: 'name_asc', label: 'Nama A-Z' },
  { value: 'name_desc', label: 'Nama Z-A' },
  { value: 'price_asc', label: 'Harga Terendah' },
  { value: 'price_desc', label: 'Harga Tertinggi' },
  { value: 'newest', label: 'Terbaru' }
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category')
  const searchQuery = searchParams.get('search')
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchQuery || '')
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || 'all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory)
      params.append('sortBy', sortBy)
      
      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, sortBy])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('all')
    setSortBy('newest')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Produk' }]} />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedCategory !== 'all' 
              ? categories.find(c => c.slug === selectedCategory)?.name || 'Produk'
              : 'Semua Produk'}
          </h1>
          <p className="text-gray-600">
            Temukan produk kecantikan dan perlengkapan bayi berkualitas
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Filter</h3>
                
                {/* Categories */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Kategori</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === 'all' 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Semua Kategori
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.slug 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Urutkan</h4>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search and Mobile Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Cari produk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full px-3"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              
              <Button
                variant="outline"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <Card className="lg:hidden mb-6">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Kategori</h4>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Semua Kategori</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.slug}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Urutkan</h4>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Reset Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Filters */}
            {(selectedCategory !== 'all' || search) && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm text-gray-500">Filter aktif:</span>
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {categories.find(c => c.slug === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory('all')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {search && (
                  <Badge variant="secondary" className="gap-1">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => setSearch('')}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Hapus Semua
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-0">
                      <Skeleton className="aspect-square rounded-t-lg" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-6 w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Tidak ada produk ditemukan</p>
                <Button variant="outline" onClick={clearFilters}>
                  Reset Filter
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full">
                      <CardContent className="p-0">
                        <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden">
                          <img
                            src={product.imageUrl || (product.category?.slug ? categoryImages[product.category.slug] : '/images/hero-products.png')}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-4">
                          {product.category && (
                            <p className="text-xs text-rose-600 mb-1">{product.category.name}</p>
                          )}
                          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">
                            {product.name}
                          </h3>
                          <p className="font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Results count */}
            {!loading && products.length > 0 && (
              <p className="text-sm text-gray-500 mt-6 text-center">
                Menampilkan {products.length} produk
              </p>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
