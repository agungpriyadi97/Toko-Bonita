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
  Search
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-pink-500" />
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
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-gray-500 mb-2">Info Pelanggan</h4>
                <p className="font-medium">{selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customer_phone}</p>
                {selectedOrder.customer_address && (
                  <p className="text-sm text-gray-600">{selectedOrder.customer_address}</p>
                )}
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-sm text-gray-500 mb-2">Item Pesanan</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {formatPrice(item.unit_price)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-pink-600">
                  {formatPrice(selectedOrder.total_amount)}
                </span>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Catatan:</strong> {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status Pesanan</span>
                <Badge className={`${statusConfig[selectedOrder.status].color} text-white`}>
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status Pembayaran</span>
                <Badge variant="outline" className={`${selectedOrder.payment_status === 'paid' ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'}`}>
                  {paymentStatusConfig[selectedOrder.payment_status].label}
                </Badge>
              </div>

              {/* Payment Method */}
              {selectedOrder.payment_method && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Metode Pembayaran</span>
                  <div className="flex items-center gap-1">
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

              {/* Payment Proof */}
              {selectedOrder.payment_proof && (
                <div className="space-y-2">
                  <span className="text-sm text-gray-500 block">Bukti Pembayaran</span>
                  <div className="relative rounded-lg overflow-hidden border bg-gray-50">
                    <img 
                      src={selectedOrder.payment_proof} 
                      alt="Bukti Pembayaran"
                      className="w-full h-48 object-cover"
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
              {selectedOrder.status === 'pending' && (
                <div className="flex gap-2 pt-4">
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
