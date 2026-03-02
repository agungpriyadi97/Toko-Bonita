'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CreditCard,
  Banknote,
  QrCode,
  Wallet,
  Loader2,
  Barcode
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import type { Database, Tables, DiscountType, PaymentMethod, PaymentStatus } from '@/types/database.types'

type Product = Tables<'products'> & {
  category: Tables<'categories'> | null
  stock?: number
}

interface CartItem {
  product: Product
  qty: number
  discountType: DiscountType
  discountValue: number
}

interface SplitPayment {
  method: 'cash' | 'qris' | 'transfer' | 'debit'
  amount: number
  reference?: string
}

export default function CashierPOSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Tables<'categories'>[]>([])
  const [branches, setBranches] = useState<Tables<'branches'>[]>([])
  const [warehouses, setWarehouses] = useState<Tables<'warehouses'>[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [transactionDiscountType, setTransactionDiscountType] = useState<DiscountType>('none')
  const [transactionDiscountValue, setTransactionDiscountValue] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid')
  const [cashReceived, setCashReceived] = useState(0)
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([])
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Audio for barcode scan
  const playBeep = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.value = 1000
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch {
      // Ignore audio errors
    }
  }, [])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      // Fetch branches and warehouses from our API (uses service role key)
      const [branchesRes, warehousesRes] = await Promise.all([
        fetch('/api/admin/branches'),
        fetch('/api/admin/warehouses'),
      ])
      
      const branchesData = await branchesRes.json()
      const warehousesData = await warehousesRes.json()

      const branchesList = branchesData.data || []
      const warehousesList = warehousesData.data || []

      setBranches(branchesList)
      setWarehouses(warehousesList)

      // Fetch products from Supabase (anon key works for products with RLS)
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)').eq('is_active', true),
        supabase.from('categories').select('*'),
      ])

      setProducts(productsRes.data || [])
      setCategories(categoriesRes.data || [])

      if (branchesList.length > 0) {
        setSelectedBranch(branchesList[0].id)
      }
    }

    fetchData()
  }, [supabase])

  // Set default warehouse when branch changes
  useEffect(() => {
    if (selectedBranch && warehouses.length > 0) {
      const branchWarehouse = warehouses.find(w => w.branch_id === selectedBranch)
      if (branchWarehouse) {
        setSelectedWarehouse(branchWarehouse.id)
      }
    }
  }, [selectedBranch, warehouses])

  // Fetch stock when warehouse changes
  useEffect(() => {
    const fetchStock = async () => {
      if (!selectedWarehouse) return

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        if (cart.length > 0 && !loading) {
          setShowPaymentDialog(true)
        }
      }
      if (e.key === 'Delete' && !e.ctrlKey && !e.altKey) {
        if (document.activeElement === document.body || document.activeElement === searchInputRef.current) {
          setCart([])
          toast.info('Keranjang dikosongkan')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cart.length, loading])

  // Auto focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Generate UUID for idempotency key
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Search and add product by barcode/SKU
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const product = products.find(
      p => p.barcode === search || p.sku === search || 
           p.name.toLowerCase().includes(search.toLowerCase())
    )

    if (product) {
      addToCart(product)
      setSearch('')
      playBeep()
    } else {
      toast.error('Produk tidak ditemukan')
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      const currentQty = existing?.qty || 0
      const stock = product.stock || 0

      if (currentQty >= stock) {
        toast.error('Stok tidak mencukupi')
        return prev
      }

      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }

      return [...prev, { 
        product, 
        qty: 1, 
        discountType: 'none' as DiscountType, 
        discountValue: 0 
      }]
    })
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id !== productId) return item
        
        const newQty = item.qty + delta
        const stock = item.product.stock || 0

        if (newQty <= 0) return item
        if (newQty > stock) {
          toast.error('Stok tidak mencukupi')
          return item
        }

        return { ...item, qty: newQty }
      })
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId))
  }

  const updateItemDiscount = (productId: string, discountType: DiscountType, discountValue: number) => {
    setCart(prev => prev.map(item =>
      item.product.id === productId
        ? { ...item, discountType, discountValue }
        : item
    ))
  }

  // Calculate totals
  const calculateItemSubtotal = (item: CartItem) => {
    return item.product.price * item.qty
  }

  const calculateItemDiscount = (item: CartItem) => {
    const subtotal = calculateItemSubtotal(item)
    if (item.discountType === 'percent') {
      return Math.round(subtotal * item.discountValue / 100)
    } else if (item.discountType === 'amount') {
      return Math.min(item.discountValue, subtotal)
    }
    return 0
  }

  const calculateItemFinal = (item: CartItem) => {
    return calculateItemSubtotal(item) - calculateItemDiscount(item)
  }

  const subtotal = cart.reduce((sum, item) => sum + calculateItemSubtotal(item), 0)

  let transactionDiscount = 0
  if (transactionDiscountType === 'percent') {
    transactionDiscount = Math.round(subtotal * transactionDiscountValue / 100)
  } else if (transactionDiscountType === 'amount') {
    transactionDiscount = Math.min(transactionDiscountValue, subtotal)
  }

  const finalAmount = subtotal - transactionDiscount

  // Split payment handling
  const addSplitPayment = (method: SplitPayment['method']) => {
    const existing = splitPayments.find(p => p.method === method)
    if (existing) {
      setSplitPayments(prev => prev.filter(p => p.method !== method))
    } else {
      const remaining = finalAmount - splitPayments.reduce((sum, p) => sum + p.amount, 0)
      setSplitPayments(prev => [...prev, { method, amount: remaining > 0 ? remaining : 0 }])
    }
  }

  const updateSplitPaymentAmount = (method: SplitPayment['method'], amount: number) => {
    setSplitPayments(prev => prev.map(p =>
      p.method === method ? { ...p, amount } : p
    ))
  }

  const totalSplitPayment = splitPayments.reduce((sum, p) => sum + p.amount, 0)
  const change = paymentMethod === 'cash' ? Math.max(0, cashReceived - finalAmount) : 0

  // Submit transaction
  const handleSubmit = async () => {
    if (!selectedBranch || !selectedWarehouse) {
      toast.error('Pilih cabang dan gudang terlebih dahulu')
      return
    }

    if (cart.length === 0) {
      toast.error('Keranjang kosong')
      return
    }

    // Validate payment
    if (paymentMethod === 'cash' && cashReceived < finalAmount) {
      toast.error('Uang yang diterima kurang')
      return
    }

    if (paymentMethod === 'split' && Math.abs(totalSplitPayment - finalAmount) > 1) {
      toast.error('Total pembayaran split harus sama dengan total transaksi')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const idemKey = generateUUID()
      
      // Build items array
      const items = cart.map(item => ({
        product_id: item.product.id,
        qty: item.qty,
        discount_type: item.discountType,
        discount_value: item.discountValue,
      }))

      // Build payment object
      const payment: Record<string, unknown> = {
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        cash_received: paymentMethod === 'cash' ? cashReceived : 0,
        notes: notes || '',
      }

      if (paymentMethod === 'split') {
        payment.payments = splitPayments.map(p => ({
          method: p.method,
          amount: p.amount,
          reference: p.reference || null,
        }))
      }

      const { data, error } = await supabase.rpc('create_transaction', {
        p_idem_key: idemKey,
        p_cashier_id: user.id,
        p_branch_id: selectedBranch,
        p_warehouse_id: selectedWarehouse,
        p_items: items,
        p_tx_discount_type: transactionDiscountType,
        p_tx_discount_value: transactionDiscountValue,
        p_payment: payment,
      })

      if (error) throw error

      const result = data as { transaction_id: string; final_amount: number; change_amount: number }
      
      toast.success('Transaksi berhasil!')
      
      // Create notification for completed transaction
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'transaction_completed',
            title: 'Transaksi Selesai',
            message: `Transaksi ${formatCurrency(result.final_amount)} telah berhasil diproses`,
            data: { 
              transaction_id: result.transaction_id, 
              amount: result.final_amount 
            },
            branch_id: selectedBranch
          })
        })
      } catch (notifError) {
        console.log('Could not create notification:', notifError)
      }
      
      // Reset form
      setCart([])
      setTransactionDiscountType('none')
      setTransactionDiscountValue(0)
      setPaymentMethod('cash')
      setPaymentStatus('paid')
      setCashReceived(0)
      setSplitPayments([])
      setNotes('')
      setShowPaymentDialog(false)

      // Open receipt in new window
      window.open(`/dashboard/cashier/receipt/${result.transaction_id}`, '_blank', 'width=320,height=600')
      
    } catch (error) {
      console.error('Transaction error:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal memproses transaksi')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode === search ||
        p.sku === search
      )
    : products

  const paymentMethodIcons = {
    cash: Banknote,
    qris: QrCode,
    transfer: Wallet,
    debit: CreditCard,
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-4">
      {/* Left Panel - Product List */}
      <div className="lg:w-2/3 flex flex-col min-h-0">
        {/* Branch & Warehouse Selection */}
        <Card className="mb-4 flex-shrink-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <Label className="text-xs text-gray-500">Cabang</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-0">
                <Label className="text-xs text-gray-500">Gudang</Label>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih gudang" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.filter(w => w.branch_id === selectedBranch).map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="mb-4">
          <div className="relative">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Scan barcode / Cari produk (F2)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Products Grid */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-3">
                  <div className="aspect-square bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="h-8 w-8 text-pink-300" />
                    )}
                  </div>
                  <p className="font-medium text-sm line-clamp-2 mb-1">{product.name}</p>
                  <p className="text-xs text-gray-500 mb-1">
                    Stok: {product.stock || 0}
                  </p>
                  <p className="text-sm font-bold text-pink-600">
                    {formatCurrency(product.price)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Cart */}
      <div className="lg:w-1/3 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <div className="p-2 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Keranjang
              </h2>
              <Badge variant="secondary" className="text-xs">{cart.length} item</Badge>
            </div>
          </div>
          
          {/* Cart Items */}
          <ScrollArea className="flex-1 p-2">
            {cart.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <ShoppingCart className="h-8 w-8 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-gray-50 rounded-lg p-2">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <p className="font-medium text-xs">{item.product.name}</p>
                        <p className="text-[10px] text-gray-500">{formatCurrency(item.product.price)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-red-500"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.product.id, -1)}
                        >
                          <Minus className="h-2 w-2" />
                        </Button>
                        <span className="w-6 text-center font-medium text-xs">{item.qty}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => updateQuantity(item.product.id, 1)}
                        >
                          <Plus className="h-2 w-2" />
                        </Button>
                      </div>
                      <p className="font-bold text-pink-600 text-xs">
                        {formatCurrency(calculateItemFinal(item))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <Separator />

          {/* Transaction Discount & Totals */}
          <div className="p-2 space-y-2">
            <div className="flex gap-2 items-center">
              <Label className="text-xs whitespace-nowrap">Diskon</Label>
              <Select
                value={transactionDiscountType}
                onValueChange={(v) => setTransactionDiscountType(v as DiscountType)}
              >
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa</SelectItem>
                  <SelectItem value="percent">Persen %</SelectItem>
                  <SelectItem value="amount">Nominal Rp</SelectItem>
                </SelectContent>
              </Select>
              {transactionDiscountType !== 'none' && (
                <Input
                  type="number"
                  className="flex-1 h-8 text-xs"
                  value={transactionDiscountValue}
                  onChange={(e) => setTransactionDiscountValue(Number(e.target.value))}
                  placeholder="Nilai"
                />
              )}
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {transactionDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon</span>
                  <span>-{formatCurrency(transactionDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold pt-1 border-t">
                <span>Total</span>
                <span className="text-pink-600">{formatCurrency(finalAmount)}</span>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
              size="sm"
              disabled={cart.length === 0 || loading}
              onClick={() => setShowPaymentDialog(true)}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Bayar
            </Button>
          </div>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Bayar</p>
              <p className="text-2xl font-bold text-pink-600">{formatCurrency(finalAmount)}</p>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Metode Pembayaran</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['cash', 'qris', 'transfer', 'debit'] as const).map(method => {
                  const Icon = paymentMethodIcons[method]
                  const isSelected = paymentMethod === method
                  return (
                    <Button
                      key={method}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      className={`h-auto py-3 ${isSelected ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Button>
                  )
                })}
              </div>
              
              {/* Split Payment Button */}
              <Button
                type="button"
                variant={paymentMethod === 'split' ? 'default' : 'outline'}
                className={`w-full mt-2 ${paymentMethod === 'split' ? 'bg-pink-500 hover:bg-pink-600' : ''}`}
                onClick={() => setPaymentMethod('split')}
              >
                Split Payment
              </Button>
            </div>

            {/* Cash Payment */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label>Uang Diterima</Label>
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(Number(e.target.value))}
                  placeholder="Jumlah uang"
                />
                {cashReceived >= finalAmount && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Kembalian</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(change)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Split Payment Details */}
            {paymentMethod === 'split' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Pilih Metode Split</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['cash', 'qris', 'transfer', 'debit'] as const).map(method => {
                    const isSelected = splitPayments.some(p => p.method === method)
                    return (
                      <Button
                        key={method}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={isSelected ? 'bg-pink-500' : ''}
                        onClick={() => addSplitPayment(method)}
                      >
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </Button>
                    )
                  })}
                </div>

                {splitPayments.map(payment => (
                  <div key={payment.method} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium capitalize mb-2">{payment.method}</p>
                    <Input
                      type="number"
                      value={payment.amount}
                      onChange={(e) => updateSplitPaymentAmount(payment.method, Number(e.target.value))}
                      placeholder="Jumlah"
                    />
                  </div>
                ))}

                <div className="flex justify-between text-sm pt-2 border-t">
                  <span>Total Split</span>
                  <span className={totalSplitPayment === finalAmount ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(totalSplitPayment)}
                  </span>
                </div>
              </div>
            )}

            {/* Payment Status for non-cash */}
            {['qris', 'transfer', 'debit'].includes(paymentMethod) && (
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={paymentStatus === 'paid'}
                  onCheckedChange={(checked) => setPaymentStatus(checked ? 'paid' : 'pending')}
                />
                <Label>Sudah dibayar</Label>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label className="text-sm font-medium">Catatan (Opsional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan transaksi"
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
              size="lg"
              disabled={loading || (paymentMethod === 'cash' && cashReceived < finalAmount) || (paymentMethod === 'split' && Math.abs(totalSplitPayment - finalAmount) > 1)}
              onClick={handleSubmit}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Proses Transaksi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
