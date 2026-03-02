'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarChart3, DollarSign, ShoppingCart, TrendingUp, Loader2, Search, FileSpreadsheet, Download, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { downloadFileFromUrl } from '@/lib/download'

interface Transaction {
  id: string
  transaction_number: string
  created_at: string
  final_amount: number
  cash_received: number
  change_amount: number
  payment_method: string
  payment_status: string
  paid_at: string | null
  cashier: {
    full_name: string
  }
  items: {
    product_name: string
    qty: number
    unit_price: number
    final_subtotal: number
  }[]
}

interface Summary {
  totalRevenue: number
  totalTransactions: number
  totalItems: number
  avgTransaction: number
  todayRevenue: number
  todayTransactions: number
}

interface DailySales {
  date: string
  revenue: number
  transactions: number
}

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly'

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Period filter
  const [periodType, setPeriodType] = useState<PeriodType>('monthly')
  
  // Custom date filter states
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(1) // First day of current month
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [paymentMethod, setPaymentMethod] = useState('all')

  // Pagination state - paginate by transactions, not items
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Helper function to set date range based on period type
  const setDateRangeByPeriod = useCallback((period: PeriodType) => {
    const today = new Date()
    let start: Date
    
    switch (period) {
      case 'daily':
        start = today
        break
      case 'weekly':
        start = new Date(today)
        start.setDate(today.getDate() - 7)
        break
      case 'monthly':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'yearly':
        start = new Date(today.getFullYear(), 0, 1)
        break
      default:
        start = new Date(today.getFullYear(), today.getMonth(), 1)
    }
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])

  const fetchReportData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        paymentMethod,
        paymentStatus: 'paid', // Only fetch paid transactions
        search: searchQuery
      })

      const res = await fetch(`/api/reports?${params}`)
      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Filter only paid transactions
      const paidTransactions = (data.transactions || []).filter(
        (t: Transaction) => t.payment_status === 'paid'
      )
      setTransactions(paidTransactions)
      setSummary(data.summary || null)
      setDailySales(data.dailySales || [])
    } catch (error) {
      console.error('Error fetching report:', error)
      toast.error('Gagal memuat data laporan')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, paymentMethod, searchQuery])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, startDate, endDate, paymentMethod])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleExport = async () => {
    setExporting(true)
    toast.info('Mengunduh laporan...')
    
    try {
      // Build URL with filters
      const params = new URLSearchParams({
        from: startDate,
        to: endDate,
        method: paymentMethod,
        status: 'paid'
      })
      
      const success = await downloadFileFromUrl(
        `/api/admin/reports/export?${params}`,
        `laporan-penjualan-${startDate}-${endDate}.csv`
      )
      
      if (success) {
        toast.success('Laporan berhasil diunduh')
      } else {
        throw new Error('Download failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Gagal mengunduh laporan')
    } finally {
      setExporting(false)
    }
  }

  const maxDailyRevenue = Math.max(...dailySales.map(d => d.revenue), 1)

  // Pagination calculations - paginate by transactions
  const totalPages = Math.ceil(transactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = transactions.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Handle period change
  const handlePeriodChange = (period: PeriodType) => {
    setPeriodType(period)
    setDateRangeByPeriod(period)
  }

  // Get period label
  const getPeriodLabel = (period: PeriodType) => {
    switch (period) {
      case 'daily': return 'Hari Ini'
      case 'weekly': return 'Minggu Ini'
      case 'monthly': return 'Bulan Ini'
      case 'yearly': return 'Tahun Ini'
      default: return 'Pilih Periode'
    }
  }

  // Count total items
  const totalItemsCount = transactions.reduce((sum, t) => sum + (t.items?.length || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>
          <p className="text-gray-600">Analisis performa penjualan toko (Transaksi Lunas)</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={loading || exporting || transactions.length === 0}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Period Filter */}
            <div>
              <Label>Periode</Label>
              <Select value={periodType} onValueChange={(v) => handlePeriodChange(v as PeriodType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Hari Ini</SelectItem>
                  <SelectItem value="weekly">Minggu Ini</SelectItem>
                  <SelectItem value="monthly">Bulan Ini</SelectItem>
                  <SelectItem value="yearly">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Tanggal Akhir</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Metode Pembayaran</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Metode</SelectItem>
                  <SelectItem value="cash">Tunai</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Cari Transaksi</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="No. transaksi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          
          {/* Period Quick Info */}
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-pink-50 px-3 py-2 rounded-lg">
            <Calendar className="h-4 w-4 text-pink-500" />
            <span>Periode: <strong>{getPeriodLabel(periodType)}</strong> ({startDate} s/d {endDate})</span>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pendapatan
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalRevenue)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Periode: {startDate} s/d {endDate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Transaksi
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-100">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalTransactions}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Rata-rata: {formatCurrency(summary.avgTransaction)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Item Terjual
              </CardTitle>
              <div className="p-2 rounded-lg bg-purple-100">
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalItems}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Item terjual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Status Transaksi
              </CardTitle>
              <div className="p-2 rounded-lg bg-green-100">
                <span className="text-green-600 text-sm font-bold">✓</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {transactions.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Semua transaksi lunas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Sales Chart */}
      {dailySales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Grafik Penjualan Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailySales.slice(-14).map((day, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-500">
                    {new Date(day.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(day.revenue / maxDailyRevenue) * 100}%`, minWidth: '60px' }}
                    >
                      {day.revenue > 0 && (
                        <span className="text-xs text-white font-medium">
                          {formatCurrency(day.revenue)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-500 text-right">
                    {day.transactions} trx
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Transaksi ({transactions.length} transaksi, {totalItemsCount} item)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data transaksi untuk periode ini
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No. Transaksi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Kasir</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((t) => {
                      const itemCount = t.items?.length || 0
                      return t.items?.map((item, idx) => (
                        <TableRow key={`${t.id}-${idx}`}>
                          {idx === 0 && (
                            <>
                              <TableCell rowSpan={itemCount} className="font-medium align-top">
                                {t.transaction_number}
                              </TableCell>
                              <TableCell rowSpan={itemCount} className="text-sm align-top">
                                {formatDate(t.created_at)}
                              </TableCell>
                              <TableCell rowSpan={itemCount} className="align-top">
                                {t.cashier?.full_name || '-'}
                              </TableCell>
                            </>
                          )}
                          <TableCell>
                            {item.product_name || 'Produk tidak dikenal'}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.qty}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unit_price)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.final_subtotal)}
                          </TableCell>
                          {idx === 0 && (
                            <>
                              <TableCell rowSpan={itemCount} className="align-top">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  t.payment_method === 'cash' ? 'bg-green-100 text-green-700' :
                                  t.payment_method === 'transfer' ? 'bg-blue-100 text-blue-700' :
                                  t.payment_method === 'qris' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {t.payment_method === 'cash' ? 'Tunai' :
                                   t.payment_method === 'transfer' ? 'Transfer' :
                                   t.payment_method === 'qris' ? 'QRIS' :
                                   t.payment_method === 'debit' ? 'Debit' : t.payment_method}
                                </span>
                              </TableCell>
                              <TableCell rowSpan={itemCount} className="align-top">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  Lunas
                                </span>
                                {t.paid_at && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {formatDate(t.paid_at)}
                                  </p>
                                )}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t gap-4">
                  <p className="text-sm text-gray-500">
                    Menampilkan {startIndex + 1} - {Math.min(endIndex, transactions.length)} dari {transactions.length} transaksi
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => goToPage(pageNum)}
                            className={`w-9 ${currentPage === pageNum ? "bg-pink-500 hover:bg-pink-600" : ""}`}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
