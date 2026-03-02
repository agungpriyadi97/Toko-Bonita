'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Phone,
  MapPin,
  Loader2,
  RefreshCw,
  Package,
  CreditCard,
  QrCode,
  Wallet,
  Building2,
  Image as ImageIcon,
  ExternalLink,
  FileText,
  Search,
  Truck,
  Printer
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string | null
  notes: string | null
  subtotal: number
  shipping_method: string | null
  shipping_cost: number | null
  total_amount: number
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_method: 'cash' | 'qris' | 'transfer' | 'debit' | null
  payment_proof: string | null
  created_at: string
  items: OrderItem[]
}

const statusConfig = {
  pending: { label: 'Menunggu', color: 'bg-yellow-500', icon: Clock },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-500', icon: CheckCircle },
  processing: { label: 'Diproses', color: 'bg-purple-500', icon: Package },
  completed: { label: 'Selesai', color: 'bg-green-500', icon: CheckCircle },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-500', icon: XCircle },
}

const paymentStatusConfig = {
  pending: { label: 'Belum Bayar', color: 'bg-orange-500' },
  paid: { label: 'Sudah Bayar', color: 'bg-green-500' },
  refunded: { label: 'Dikembalikan', color: 'bg-gray-500' },
}

const paymentMethodConfig = {
  cash: { label: 'Tunai', icon: Wallet },
  transfer: { label: 'Transfer Bank', icon: Building2 },
  qris: { label: 'QRIS', icon: QrCode },
  debit: { label: 'Kartu Debit', icon: CreditCard },
}

const shippingMethodConfig: Record<string, { label: string; icon: typeof Truck }> = {
  pickup: { label: 'Ambil di Toka', icon: Package },
  jne: { label: 'JNE', icon: Truck },
  jnt: { label: 'J&T Express', icon: Truck },
  sicepat: { label: 'SiCepat', icon: Truck },
  pos: { label: 'POS Indonesia', icon: Truck },
  gosend: { label: 'GoSend', icon: Truck },
  grab: { label: 'Grab Express', icon: Truck },
}

export default function CashierOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const searchParams = useSearchParams()
  const highlightedCardRef = useRef<HTMLDivElement>(null)

  const fetchOrders = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true)
    }
    try {
      const response = await fetch('/api/orders', {
        next: { revalidate: 5 } // Cache for 5 seconds
      })
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Gagal memuat pesanan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    // Refresh every 60 seconds (reduced frequency)
    const interval = setInterval(() => fetchOrders(false), 60000)
    return () => clearInterval(interval)
  }, [])

  // Handle highlight from URL parameter
  useEffect(() => {
    const highlightOrderId = searchParams.get('order')
    if (highlightOrderId && orders.length > 0 && highlightOrderId !== highlightedOrderId) {
      setHighlightedOrderId(highlightOrderId)
      // Find the order and switch to the correct tab
      const order = orders.find(o => o.id === highlightOrderId)
      if (order) {
        if (order.status === 'pending') {
          setActiveTab('pending')
        } else if (['confirmed', 'processing'].includes(order.status)) {
          setActiveTab('active')
        } else if (order.status === 'completed') {
          setActiveTab('completed')
        } else {
          setActiveTab('all')
        }
        // Open the detail dialog immediately
        setSelectedOrder(order)
        setShowDetail(true)
      }
      // Remove highlight after 2 seconds
      setTimeout(() => {
        setHighlightedOrderId(null)
      }, 2000)
    }
  }, [searchParams, orders.length])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: id 
      })
    } catch {
      return ''
    }
  }

  const printShippingLabel = (order: Order) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Tidak dapat membuka jendela cetak. Pastikan pop-up diizinkan.')
      return
    }

    const shippingLabel = shippingMethodConfig[order.shipping_method || ''] || { label: order.shipping_method }
    const items = order.items || []
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Label Pengiriman - ${order.order_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 10mm;
            background: white;
          }
          .label {
            width: 100mm;
            max-width: 100%;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 5mm;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .store-name {
            font-size: 16px;
            font-weight: bold;
          }
          .shipping-courier {
            font-size: 18px;
            font-weight: bold;
            background: #f0f0f0;
            padding: 5px;
            text-align: center;
            margin-bottom: 10px;
            border: 1px solid #ccc;
          }
          .section {
            margin-bottom: 10px;
          }
          .section-title {
            font-size: 10px;
            color: #666;
            margin-bottom: 2px;
          }
          .section-content {
            font-size: 12px;
          }
          .sender, .receiver {
            border: 1px solid #ccc;
            padding: 5px;
            margin-bottom: 5px;
          }
          .receiver {
            background: #f9f9f9;
          }
          .order-info {
            font-size: 10px;
            border-top: 1px dashed #ccc;
            padding-top: 5px;
            margin-top: 5px;
          }
          .items {
            font-size: 9px;
            color: #666;
          }
          .barcode {
            text-align: center;
            margin-top: 10px;
            font-family: monospace;
            font-size: 14px;
            letter-spacing: 2px;
          }
          @media print {
            body { padding: 0; }
            .label { border: 2px solid #000; }
          }
        </style>
      </head>
      <body>
        <div class="label">
          <div class="header">
            <div class="store-name">TOKO BONITA</div>
            <div style="font-size: 10px;">Kecantikan & Perlengkapan Bayi</div>
          </div>
          
          <div class="shipping-courier">
            ${shippingLabel.label}
          </div>
          
          <div class="sender section">
            <div class="section-title">PENGIRIM:</div>
            <div class="section-content">
              <strong>Toko Bonita</strong><br>
              Jl. Contoh Alamat No. 123<br>
              Telp: 08123456789
            </div>
          </div>
          
          <div class="receiver section">
            <div class="section-title">PENERIMA:</div>
            <div class="section-content">
              <strong>${order.customer_name}</strong><br>
              ${order.customer_phone}<br>
              ${order.customer_address || '-'}
            </div>
          </div>
          
          <div class="order-info">
            <strong>No. Pesanan:</strong> ${order.order_number}<br>
            <strong>Tanggal:</strong> ${new Date(order.created_at).toLocaleDateString('id-ID')}<br>
            <strong>Item:</strong>
            <div class="items">
              ${items.map(item => `• ${item.product_name} (${item.quantity}x)`).join('<br>')}
            </div>
          </div>
          
          <div class="barcode">
            ||| || ||| | || ||||| |||<br>
            ${order.order_number}
          </div>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `
    
    printWindow.document.write(html)
    printWindow.document.close()
  }

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setProcessing(orderId)
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Pesanan ${status === 'confirmed' ? 'dikonfirmasi' : status === 'completed' ? 'selesai' : 'dibatalkan'}`)
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status } : null)
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Gagal mengupdate pesanan')
    } finally {
      setProcessing(null)
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: 'paid', paymentMethod: 'cash' | 'qris' | 'transfer' | 'debit') => {
    setProcessing(orderId)
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, payment_status: paymentStatus, payment_method: paymentMethod })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Status pembayaran diupdate')
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, payment_status: paymentStatus, payment_method: paymentMethod } : null)
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error('Gagal mengupdate pembayaran')
    } finally {
      setProcessing(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    // Filter by tab/status
    let statusMatch = true
    if (activeTab !== 'all') {
      if (activeTab === 'active') {
        statusMatch = ['pending', 'confirmed', 'processing'].includes(order.status)
      } else {
        statusMatch = order.status === activeTab
      }
    }
    
    // Filter by search query
    let searchMatch = true
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      searchMatch = 
        order.order_number.toLowerCase().includes(query) ||
        order.customer_name.toLowerCase().includes(query) ||
        order.customer_phone.includes(query)
    }
    
    return statusMatch && searchMatch
  })

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-sm text-gray-600">Kelola pesanan pelanggan</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari no. pesanan, nama, HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={fetchOrders} disabled={loading} className="shrink-0">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="grid grid-cols-4 w-full min-w-[320px] sm:max-w-md">
            <TabsTrigger value="pending" className="relative text-xs sm:text-sm">
              Baru
              {orderCounts.pending > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {orderCounts.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">Aktif</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">Selesai</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">Semua</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-4 sm:mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Tidak ada pesanan</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon
                const isHighlighted = highlightedOrderId === order.id
                
                return (
                  <Card 
                    key={order.id} 
                    ref={isHighlighted ? highlightedCardRef : null}
                    className={`overflow-hidden transition-all duration-300 ${isHighlighted ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Status indicator */}
                        <div className={`${status.color} h-1 sm:h-auto sm:w-2`} />
                        
                        <div className="flex-1 p-3 sm:p-4">
                          <div className="flex flex-col gap-3">
                            {/* Order Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <div className="flex items-center gap-1.5 bg-pink-50 px-2 py-1 rounded-md">
                                  <FileText className="h-3.5 w-3.5 text-pink-500" />
                                  <span className="font-mono text-xs sm:text-sm font-bold text-pink-600">
                                    {order.order_number}
                                  </span>
                                </div>
                                <Badge className={`${status.color} text-white text-xs`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {status.label}
                                </Badge>
                                {order.shipping_method && order.shipping_method !== 'pickup' && (
                                  <Badge variant="outline" className="text-xs border-blue-400 text-blue-600">
                                    <Truck className="h-3 w-3 mr-1" />
                                    {shippingMethodConfig[order.shipping_method]?.label || order.shipping_method}
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                                {order.customer_name}
                              </h3>
                              
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  {order.customer_phone}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  {formatTime(order.created_at)}
                                </div>
                              </div>
                              {order.customer_address && (
                                <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-gray-500">
                                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span className="truncate">{order.customer_address}</span>
                                </div>
                              )}

                              {/* Order Items Preview */}
                              <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2">
                                {order.items?.slice(0, 3).map((item, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {item.product_name} x{item.quantity}
                                  </Badge>
                                ))}
                                {order.items?.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{order.items.length - 3} lainnya
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Price & Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-3 border-t sm:border-t-0">
                              <div className="text-left sm:text-right">
                                <p className="text-xs text-gray-500">Total</p>
                                <p className="text-lg sm:text-xl font-bold text-pink-600">
                                  {formatPrice(order.total_amount)}
                                </p>
                                <Badge 
                                  variant="outline" 
                                  className={`mt-1 text-xs ${order.payment_status === 'paid' ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'}`}
                                >
                                  {paymentStatusConfig[order.payment_status].label}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedOrder(order)
                                    setShowDetail(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Detail</span>
                                </Button>
                                {order.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600"
                                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                      disabled={processing === order.id}
                                    >
                                      {processing === order.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                      )}
                                      Terima
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                      disabled={processing === order.id}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                {order.status === 'confirmed' && order.payment_status === 'pending' && (
                                  <Button
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600"
                                    onClick={() => updatePaymentStatus(order.id, 'paid', 'cash')}
                                    disabled={processing === order.id}
                                  >
                                    {processing === order.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      'Bayar'
                                    )}
                                  </Button>
                                )}
                                {order.status === 'confirmed' && order.payment_status === 'paid' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600"
                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                    disabled={processing === order.id}
                                  >
                                    {processing === order.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                    )}
                                    Selesai
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pr-8">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-pink-500 flex-shrink-0" />
              Detail Pesanan
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1.5">
              <span className="bg-pink-50 px-2 py-1 rounded-md font-mono text-sm font-bold text-pink-600">
                {selectedOrder?.order_number}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-sm text-gray-500 mb-2">Info Pelanggan</h4>
                <p className="font-medium break-words">{selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-600 break-all">{selectedOrder.customer_phone}</p>
                {selectedOrder.customer_address && (
                  <p className="text-sm text-gray-600 break-words mt-1">{selectedOrder.customer_address}</p>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-sm text-gray-500 mb-2">Item Pesanan</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start py-2 border-b gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium break-words">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold whitespace-nowrap">{formatPrice(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Method */}
              {selectedOrder.shipping_method && selectedOrder.shipping_method !== 'pickup' && (
                <div className="flex justify-between items-center py-2 border-b gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Truck className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-500 truncate">Pengiriman ({shippingMethodConfig[selectedOrder.shipping_method]?.label || selectedOrder.shipping_method})</span>
                  </div>
                  <p className="font-semibold whitespace-nowrap">{formatPrice(selectedOrder.shipping_cost || 0)}</p>
                </div>
              )}

              {/* Total */}
              <div className="space-y-1 pt-2 border-t">
                <div className="flex justify-between items-center text-sm gap-2">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="whitespace-nowrap">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.shipping_cost && selectedOrder.shipping_cost > 0 && (
                  <div className="flex justify-between items-center text-sm gap-2">
                    <span className="text-gray-500">Ongkir</span>
                    <span className="whitespace-nowrap">{formatPrice(selectedOrder.shipping_cost)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center gap-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg sm:text-xl font-bold text-pink-600 whitespace-nowrap">
                    {formatPrice(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-700 break-words">
                    <strong>Catatan:</strong> {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-500">Status Pesanan</span>
                <Badge className={`${statusConfig[selectedOrder.status].color} text-white`}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-gray-500">Status Pembayaran</span>
                <Badge variant="outline" className={`${selectedOrder.payment_status === 'paid' ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'}`}>
                  {paymentStatusConfig[selectedOrder.payment_status].label}
                </Badge>
              </div>

              {/* Payment Method */}
              {selectedOrder.payment_method && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-gray-500">Metode Pembayaran</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {(() => {
                      const methodConfig = paymentMethodConfig[selectedOrder.payment_method!]
                      const MethodIcon = methodConfig?.icon || Wallet
                      return (
                        <>
                          <MethodIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{methodConfig?.label || selectedOrder.payment_method}</span>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* Shipping Method */}
              {selectedOrder.shipping_method && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-gray-500">Metode Pengiriman</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {(() => {
                      const shippingConfig = shippingMethodConfig[selectedOrder.shipping_method]
                      const ShippingIcon = shippingConfig?.icon || Truck
                      return (
                        <>
                          <ShippingIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{shippingConfig?.label || selectedOrder.shipping_method}</span>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* Payment Proof */}
              {selectedOrder.payment_proof && (
                <div className="space-y-2">
                  <span className="text-sm text-gray-500 block">Bukti Pembayaran</span>
                  <div className="relative rounded-lg overflow-hidden border bg-gray-50">
                    <img 
                      src={selectedOrder.payment_proof} 
                      alt="Bukti Pembayaran"
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                    <a
                      href={selectedOrder.payment_proof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-md p-2 hover:bg-white transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-600" />
                    </a>
                  </div>
                </div>
              )}

              {/* Actions */}
              {/* Print Shipping Label Button - Show for orders with shipping */}
              {selectedOrder.shipping_method && selectedOrder.shipping_method !== 'pickup' && selectedOrder.customer_address && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full border-pink-500 text-pink-600 hover:bg-pink-50"
                    onClick={() => printShippingLabel(selectedOrder)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Cetak Label Pengiriman
                  </Button>
                </div>
              )}

              {selectedOrder.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'confirmed')
                      setShowDetail(false)
                    }}
                    disabled={processing === selectedOrder.id}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terima Pesanan
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'cancelled')
                      setShowDetail(false)
                    }}
                    disabled={processing === selectedOrder.id}
                  >
                    Tolak
                  </Button>
                </div>
              )}

              {selectedOrder.status === 'confirmed' && selectedOrder.payment_status === 'pending' && (
                <div className="pt-4">
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      updatePaymentStatus(selectedOrder.id, 'paid', 'cash')
                    }}
                    disabled={processing === selectedOrder.id}
                  >
                    {processing === selectedOrder.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Tandai Sudah Bayar
                  </Button>
                </div>
              )}

              {selectedOrder.status === 'confirmed' && selectedOrder.payment_status === 'paid' && (
                <div className="pt-4">
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, 'completed')
                      setShowDetail(false)
                    }}
                    disabled={processing === selectedOrder.id}
                  >
                    {processing === selectedOrder.id ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Selesaikan Pesanan
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
