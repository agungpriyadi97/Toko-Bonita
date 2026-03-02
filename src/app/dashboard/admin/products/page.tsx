'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit, Trash2, Package, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/lib/supabase-client'
import { ProductFormDialog } from '@/components/admin/product-form-dialog'
import type { Tables } from '@/types/database.types'

type Product = Tables<'products'> & {
  category: Tables<'categories'> | null
  stock?: number
  image_url?: string | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stockMap, setStockMap] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const supabase = getSupabaseClient()
  const searchParams = useSearchParams()
  const highlightedRowRef = useRef<HTMLTableRowElement>(null)

  const fetchData = async () => {
    const [productsRes, stocksRes] = await Promise.all([
      supabase
        .from('products')
        .select(`*, category:categories(*)`)
        .order('name'),
      supabase
        .from('product_stocks')
        .select('product_id, stock')
    ])

    if (productsRes.data) {
      setProducts(productsRes.data as Product[])
    }

    const map = new Map<string, number>()
    stocksRes.data?.forEach(s => {
      const current = map.get(s.product_id) || 0
      map.set(s.product_id, current + (s.stock || 0))
    })
    setStockMap(map)
    setLoading(false)
  }

  // Initial fetch using startTransition
  useEffect(() => {
    startTransition(() => {
      void fetchData()
    })
  }, [])

  // Handle highlight from URL parameter
  useEffect(() => {
    const highlight = searchParams.get('highlight')
    if (highlight && highlight !== highlightedId && !loading) {
      // Defer state update to next frame
      requestAnimationFrame(() => {
        setHighlightedId(highlight)
        // Scroll after render
        setTimeout(() => {
          if (highlightedRowRef.current) {
            highlightedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
        // Remove highlight after 2 seconds
        setTimeout(() => {
          setHighlightedId(null)
        }, 2000)
      })
    }
  }, [searchParams, loading])

  const handleAdd = () => {
    setSelectedProduct(null)
    setDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`Hapus produk "${product.name}"?`)) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    if (error) {
      toast.error('Gagal menghapus produk')
      return
    }

    toast.success('Produk berhasil dihapus')
    startTransition(() => {
      void fetchData()
    })
  }

  const handleSuccess = () => {
    startTransition(() => {
      void fetchData()
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  if (loading || isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-600">Daftar semua produk</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-pink-500 to-purple-600"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          {products && products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gambar</TableHead>
                  <TableHead>Nama Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Barcode</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-center">Stok</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stock = stockMap.get(product.id) || 0
                  const isLowStock = stock > 0 && stock < 5
                  const isOutOfStock = stock === 0
                  const isHighlighted = highlightedId === product.id
                  
                  return (
                    <TableRow 
                      key={product.id}
                      ref={isHighlighted ? highlightedRowRef : null}
                      className={isHighlighted ? 'bg-yellow-100 animate-pulse' : ''}
                    >
                      <TableCell>
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-pink-300" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {product.name}
                          {isLowStock && (
                            <span className="flex items-center gap-1 text-yellow-600" title="Stok menipis">
                              <AlertTriangle className="h-4 w-4" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.category?.name || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{product.barcode || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{product.sku || '-'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={stock > 0 ? 'default' : 'secondary'}
                          className={isOutOfStock ? 'bg-red-500 hover:bg-red-600' : isLowStock ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                        >
                          {stock} pcs
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Belum ada produk</p>
              <p className="text-sm">Klik tombol "Tambah Produk" untuk menambah produk baru</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {products && products.length > 0 ? (
          products.map((product) => {
            const stock = stockMap.get(product.id) || 0
            const isLowStock = stock > 0 && stock < 5
            const isOutOfStock = stock === 0
            const isHighlighted = highlightedId === product.id
            
            return (
              <Card 
                key={product.id}
                ref={isHighlighted ? highlightedRowRef : null}
                className={isHighlighted ? 'bg-yellow-100 border-yellow-400' : ''}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 flex-shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-pink-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 truncate flex items-center gap-1">
                            {product.name}
                            {isLowStock && (
                              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                            )}
                          </h3>
                          <p className="text-sm text-gray-500">{product.category?.name || '-'}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-bold text-pink-600">{formatCurrency(product.price)}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={stock > 0 ? 'default' : 'secondary'}
                            className={isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-yellow-500' : ''}
                          >
                            {stock} pcs
                          </Badge>
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </div>
                      </div>
                      {(product.barcode || product.sku) && (
                        <p className="text-xs text-gray-400 mt-1">
                          {product.sku && `SKU: ${product.sku}`}
                          {product.sku && product.barcode && ' • '}
                          {product.barcode && `${product.barcode}`}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada produk</p>
            <p className="text-sm">Klik tombol "Tambah Produk" untuk menambah produk baru</p>
          </div>
        )}
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
