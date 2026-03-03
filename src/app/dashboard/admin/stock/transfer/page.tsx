'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeftRight, Loader2, Search } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Tables } from '@/types/database.types'

type Product = Tables<'products'> & {
  stock?: number
}

export default function StockTransferPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Tables<'warehouses'>[]>([])
  const [sourceWarehouse, setSourceWarehouse] = useState('')
  const [destWarehouse, setDestWarehouse] = useState('')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch products - use is_active
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      // Fetch warehouses - no is_active column
      const { data: warehousesData } = await supabase
        .from('warehouses')
        .select('*')

      setProducts(productsData || [])
      setWarehouses(warehousesData || [])

      if (warehousesData && warehousesData.length >= 2) {
        setSourceWarehouse(warehousesData[0].id)
        setDestWarehouse(warehousesData[1].id)
      }
    }

    fetchData()
  }, [supabase])

  useEffect(() => {
    const fetchStock = async () => {
      if (!sourceWarehouse) return

      // Use 'stock' column instead of 'quantity'
      const { data: stocks } = await supabase
        .from('product_stocks')
        .select('product_id, stock')
        .eq('warehouse_id', sourceWarehouse)

      if (stocks) {
        setProducts(prev => prev.map(p => ({
          ...p,
          stock: stocks.find(s => s.product_id === p.id)?.stock || 0
        })))
      }
    }

    fetchStock()
  }, [sourceWarehouse, supabase])

  const handleTransfer = async () => {
    if (!selectedProduct || !sourceWarehouse || !destWarehouse) {
      toast.error('Pilih produk dan gudang terlebih dahulu')
      return
    }

    if (sourceWarehouse === destWarehouse) {
      toast.error('Gudang asal dan tujuan tidak boleh sama')
      return
    }

    if (quantity <= 0) {
      toast.error('Jumlah harus lebih dari 0')
      return
    }

    if ((selectedProduct.stock || 0) < quantity) {
      toast.error('Stok tidak mencukupi')
      return
    }

    setLoading(true)

    try {
      // Get source stock - use 'stock' column
      const { data: sourceStockData, error: sourceError } = await supabase
        .from('product_stocks')
        .select('stock')
        .eq('product_id', selectedProduct.id)
        .eq('warehouse_id', sourceWarehouse)
        .single()

      if (sourceError && sourceError.code !== 'PGRST116') {
        throw sourceError
      }

      const sourceStock = sourceStockData?.stock || 0

      // Get destination stock - use 'stock' column
      const { data: destStockData, error: destError } = await supabase
        .from('product_stocks')
        .select('stock')
        .eq('product_id', selectedProduct.id)
        .eq('warehouse_id', destWarehouse)
        .single()

      if (destError && destError.code !== 'PGRST116') {
        throw destError
      }

      const destStock = destStockData?.stock || 0

      // Update source stock (reduce)
      const { error: updateSourceError } = await supabase
        .from('product_stocks')
        .update({ stock: sourceStock - quantity })
        .eq('product_id', selectedProduct.id)
        .eq('warehouse_id', sourceWarehouse)
      
      if (updateSourceError) throw updateSourceError

      // Update or create destination stock (add)
      if (destStockData) {
        const { error: updateDestError } = await supabase
          .from('product_stocks')
          .update({ stock: destStock + quantity })
          .eq('product_id', selectedProduct.id)
          .eq('warehouse_id', destWarehouse)
        
        if (updateDestError) throw updateDestError
      } else {
        const { error: insertDestError } = await supabase
          .from('product_stocks')
          .insert({
            product_id: selectedProduct.id,
            warehouse_id: destWarehouse,
            stock: quantity
          })
        
        if (insertDestError) throw insertDestError
      }

      // Insert stock movement - match actual schema
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: selectedProduct.id,
          from_warehouse_id: sourceWarehouse,
          to_warehouse_id: destWarehouse,
          type: 'transfer',
          qty: quantity,
          note: notes || 'Transfer antar gudang'
        })

      if (movementError) {
        console.error('Movement error:', movementError)
        // Don't throw, stock is already updated
      }

      toast.success('Transfer stok berhasil')
      
      // Refresh stock
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, stock: sourceStock - quantity }
          : p
      ))

      // Reset form
      setSelectedProduct(null)
      setQuantity(0)
      setNotes('')

    } catch (error) {
      console.error('Transfer error:', error)
      toast.error('Gagal transfer stok: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode === search ||
    p.sku === search
  )

  const sourceWarehouseName = warehouses.find(w => w.id === sourceWarehouse)?.name
  const destWarehouseName = warehouses.find(w => w.id === destWarehouse)?.name

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transfer Stok</h1>
        <p className="text-gray-600">Pindahkan stok antar gudang</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Gudang Asal</Label>
                <Select value={sourceWarehouse} onValueChange={setSourceWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih gudang asal" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Gudang Tujuan</Label>
                <Select value={destWarehouse} onValueChange={setDestWarehouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih gudang tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Tidak ada produk</p>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id 
                        ? 'border-pink-500 bg-pink-50' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.barcode || product.sku || '-'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.stock || 0}</p>
                        <p className="text-xs text-gray-500">Stok</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transfer Form */}
        <Card>
          <CardHeader>
            <CardTitle>Form Transfer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProduct ? (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">
                    Stok di {sourceWarehouseName}: {selectedProduct.stock || 0}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 p-4 bg-pink-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Dari</p>
                    <p className="font-medium">{sourceWarehouseName}</p>
                  </div>
                  <ArrowLeftRight className="h-6 w-6 text-pink-500" />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Ke</p>
                    <p className="font-medium">{destWarehouseName}</p>
                  </div>
                </div>

                <div>
                  <Label>Jumlah Transfer</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    max={selectedProduct.stock || 0}
                  />
                </div>

                <div>
                  <Label>Catatan (Opsional)</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan transfer"
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                  onClick={handleTransfer}
                  disabled={loading || quantity <= 0 || (selectedProduct.stock || 0) < quantity}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                  )}
                  Proses Transfer
                </Button>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ArrowLeftRight className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Pilih produk untuk transfer stok</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
