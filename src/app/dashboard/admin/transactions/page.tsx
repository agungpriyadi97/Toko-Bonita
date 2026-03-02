'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Eye, Receipt, FileText, Search, Loader2 } from 'lucide-react'

interface Transaction {
  id: string
  transaction_number: string | null
  created_at: string
  final_amount: number
  payment_method: string
  payment_status: string
  cashier: { full_name: string } | null
  branch: { name: string } | null
  items: { count: number }[]
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/transactions')
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Filter transactions by search query
  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase().trim()
    return (
      tx.transaction_number?.toLowerCase().includes(query) ||
      tx.id.toLowerCase().includes(query) ||
      tx.cashier?.full_name?.toLowerCase().includes(query) ||
      tx.branch?.name?.toLowerCase().includes(query)
    )
  })

  // Calculate totals
  const totalAmount = transactions.reduce((sum, tx) => sum + (tx.final_amount || 0), 0)
  const paidCount = transactions.filter(tx => tx.payment_status === 'paid').length
  const pendingCount = transactions.filter(tx => tx.payment_status === 'pending').length

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Semua Transaksi</h1>
          <p className="text-sm text-gray-600">Riwayat transaksi dari semua cabang</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari no. transaksi, kasir, cabang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs sm:text-sm text-gray-500">Total Transaksi</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{transactions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs sm:text-sm text-gray-500">Lunas</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">{paidCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs sm:text-sm text-gray-500">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs sm:text-sm text-gray-500">Total Omzet</p>
            <p className="text-lg sm:text-xl font-bold text-pink-600">{formatCurrency(totalAmount)}</p>
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
              <CardTitle className="text-lg">Daftar Transaksi ({filteredTransactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">No. Transaksi</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Tanggal</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Kasir</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Cabang</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Items</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Metode</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-sm font-medium text-pink-600">
                              {tx.transaction_number || tx.id.slice(0, 8)}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(tx.created_at)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {tx.cashier?.full_name || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {tx.branch?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {tx.items?.[0]?.count || 0} item
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(tx.final_amount)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className="capitalize text-xs">
                            {tx.payment_method}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getStatusColor(tx.payment_status)}>
                            {tx.payment_status === 'paid' ? 'Lunas' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/dashboard/cashier/transactions/${tx.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/cashier/receipt/${tx.id}`} target="_blank">
                              <Button variant="ghost" size="icon">
                                <Receipt className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-500">
                          {searchQuery ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
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
            {filteredTransactions.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-pink-500" />
                        <span className="font-mono text-sm font-bold text-pink-600">
                          {tx.transaction_number || tx.id.slice(0, 8)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(tx.created_at)}</p>
                    </div>
                    <Badge className={getStatusColor(tx.payment_status)}>
                      {tx.payment_status === 'paid' ? 'Lunas' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-gray-500 text-xs">Kasir</p>
                      <p className="font-medium">{tx.cashier?.full_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Cabang</p>
                      <p className="font-medium">{tx.branch?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Metode</p>
                      <Badge variant="outline" className="capitalize text-xs">
                        {tx.payment_method}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Items</p>
                      <p className="font-medium">{tx.items?.[0]?.count || 0} item</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-pink-600">{formatCurrency(tx.final_amount)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/dashboard/cashier/transactions/${tx.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </Link>
                      <Link href={`/dashboard/cashier/receipt/${tx.id}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredTransactions.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  {searchQuery ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
