'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'
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
  branch: { name: string } | null
  processor: { full_name: string } | null
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true)
    }
    try {
      const response = await fetch('/api/orders', {
        next: { revalidate: 5 }
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

  // Filter orders by search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase().trim()
    return (
      order.order_number.toLowerCase().includes(query) ||
      order.customer_name.toLowerCase().includes(query) ||
      order.customer_phone.includes(query)
    )
  })

  const orderCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Semua Pesanan</h1>
          <p className="text-sm text-gray-600">Kelola pesanan dari semua cabang</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs sm:text-sm text-gray-500">Total</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{orderCounts.all}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs sm:text-sm text-gray-500">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{orderCounts.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs sm:text-sm text-gray-500">Dikonfirmasi</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{orderCounts.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs sm:text-sm text-gray-500">Selesai</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{orderCounts.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs sm:text-sm text-gray-500">Batal</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{orderCounts.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden lg:block">
            <CardHeader>
              <CardTitle className="text-lg">Daftar Pesanan ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">No. Pesanan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Tanggal</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Pelanggan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Cabang</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Pembayaran</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const status = statusConfig[order.status]
                      const StatusIcon = status.icon
                      
                      return (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-pink-500" />
                              <span className="font-mono text-sm font-bold text-pink-600">
                                {order.order_number}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              {formatTime(order.created_at)}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-sm">{order.customer_name}</p>
                            <p className="text-xs text-gray-500">{order.customer_phone}</p>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {order.branch?.name || '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-pink-600">
                            {formatPrice(order.total_amount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${order.payment_status === 'paid' ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'}`}
                            >
                              {paymentStatusConfig[order.payment_status].label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={`${status.color} text-white text-xs`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowDetail(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Detail
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500">
                          {searchQuery ? 'Tidak ada pesanan yang cocok' : 'Belum ada pesanan'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-3">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status]
              const StatusIcon = status.icon
              
              return (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-pink-500" />
                          <span className="font-mono text-sm font-bold text-pink-600">
                            {order.order_number}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{formatTime(order.created_at)}</p>
                      </div>
                      <Badge className={`${status.color} text-white text-xs`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-gray-500 text-xs">Pelanggan</p>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Cabang</p>
                        <p className="font-medium">{order.branch?.name || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t">
                      <div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${order.payment_status === 'paid' ? 'border-green-500 text-green-600' : 'border-orange-500 text-orange-600'}`}
                        >
                          {paymentStatusConfig[order.payment_status].label}
                        </Badge>
                        <p className="text-lg font-bold text-pink-600 mt-1">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowDetail(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  {searchQuery ? 'Tidak ada pesanan yang cocok' : 'Belum ada pesanan'}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

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

              {/* Branch & Processor */}
              <div className="grid grid-cols-2 gap-4">
                {selectedOrder.branch && (
                  <div>
                    <p className="text-xs text-gray-500">Cabang</p>
                    <p className="text-sm font-medium">{selectedOrder.branch.name}</p>
                  </div>
                )}
                {selectedOrder.processor && (
                  <div>
                    <p className="text-xs text-gray-500">Diproses oleh</p>
                    <p className="text-sm font-medium">{selectedOrder.processor.full_name}</p>
                  </div>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
