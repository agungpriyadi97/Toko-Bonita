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
import { Settings2, Loader2, Search } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Tables } from '@/types/database.types'

type Product = Tables<'products'> & {
  stock?: number
}

export default function StockAdjustPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Tables<'warehouses'>[]>([])
  const [selectedWarehouse, setSelectedWarehouse] = useState('')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out'>('in')
  const [quantity, setQuantity] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      // Fetch products with is_active filter
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name')

      // Fetch all warehouses (no is_active column in this table)
      const { data: warehousesData } = await supabase
        .from('warehouses')
        .select('*')

      setProducts(productsData || [])
      setWarehouses(warehousesData || [])

      if (warehousesData && warehousesData.length > 0) {
        setSelectedWarehouse(warehousesData[0].id)
      }
    }

    fetchData()
  }, [supabase])

  useEffect(() => {
    const fetchStock = async () => {
      if (!selectedWarehouse) return

      // Use 'stock' column instead of 'quantity'
      const { data: stocks } = await supabase
        .from('product_stocks')
        .select('product_id, stock')
        .eq('warehouse_id', selectedWarehouse)

      if (stocks) {
        setProducts(prev => prev.map(p => ({
          ...p,
          stock: stocks.find(s => s.product_id === p.id)?.stock || 0
        })))
      }
    }

    fetchStock()
  }, [selectedWarehouse, supabase])

  const handleAdjust = async () => {
    if (!selectedProduct || !selectedWarehouse) {
      toast.error('Pilih produk dan gudang terlebih dahulu')
      return
    }

    if (quantity <= 0) {
      toast.error('Jumlah harus lebih dari 0')
      return
    }

    setLoading(true)

    try {
      // Get current stock - use 'stock' column
      const { data: currentStock, error: stockError } = await supabase
        .from('product_stocks')
        .select('stock')
        .eq('product_id', selectedProduct.id)
        .eq('warehouse_id', selectedWarehouse)
        .single()

      if (stockError && stockError.code !== 'PGRST116') {
        throw stockError
      }

      const currentQty = currentStock?.stock || 0
      const newQty = adjustmentType === 'in' 
        ? currentQty + quantity 
        : currentQty - quantity

      if (newQty < 0) {
        toast.error('Stok tidak boleh negatif')
        setLoading(false)
        return
      }

      // Update or insert stock - use 'stock' column
      if (currentStock) {
        const { error: updateError } = await supabase
          .from('product_stocks')
          .update({ stock: newQty })
          .eq('product_id', selectedProduct.id)
          .eq('warehouse_id', selectedWarehouse)
        
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('product_stocks')
          .insert({
            product_id: selectedProduct.id,
            warehouse_id: selectedWarehouse,
            stock: newQty
          })
        
        if (insertError) throw insertError
      }

      // Insert stock movement - match actual schema
      const movementData = adjustmentType === 'in' 
        ? {
            product_id: selectedProduct.id,
            to_warehouse_id: selectedWarehouse,
            type: 'in' as const,
            qty: quantity,
            note: notes || 'Stok masuk'
          }
        : {
            product_id: selectedProduct.id,
            from_warehouse_id: selectedWarehouse,
            type: 'out' as const,
            qty: quantity,
            note: notes || 'Stok keluar'
          }

      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert(movementData)

      if (movementError) {
        console.error('Movement error:', movementError)
        // Don't throw, stock is already updated
      }

      toast.success('Stok berhasil disesuaikan')
      
      // Refresh stock
      setProducts(prev => prev.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, stock: newQty }
          : p
      ))

      // Reset form
      setSelectedProduct(null)
      setQuantity(0)
      setNotes('')

    } catch (error) {
      console.error('Adjustment error:', error)
      toast.error('Gagal menyesuaikan stok: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode === search ||
    p.sku === search
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Penyesuaian Stok</h1>
        <p className="text-gray-600">Sesuaikan stok produk secara manual</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Pilih Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Gudang</Label>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih gudang" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {/* Adjustment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Form Penyesuaian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProduct ? (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">
                    Stok saat ini: {selectedProduct.stock || 0}
                  </p>
                </div>

                <div>
                  <Label>Tipe Penyesuaian</Label>
                  <Select 
                    value={adjustmentType} 
                    onValueChange={(v) => setAdjustmentType(v as 'in' | 'out')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Stok Masuk (+)</SelectItem>
                      <SelectItem value="out">Stok Keluar (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Jumlah</Label>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                  />
                </div>

                <div>
                  <Label>Catatan (Opsional)</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Alasan penyesuaian"
                  />
                </div>

                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600">Stok setelah penyesuaian:</p>
                  <p className="text-xl font-bold text-pink-600">
                    {(selectedProduct.stock || 0) + (adjustmentType === 'in' ? quantity : -quantity)}
                  </p>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
                  onClick={handleAdjust}
                  disabled={loading || quantity <= 0}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Settings2 className="h-4 w-4 mr-2" />
                  )}
                  Simpan Penyesuaian
                </Button>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Settings2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Pilih produk untuk menyesuaikan stok</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
