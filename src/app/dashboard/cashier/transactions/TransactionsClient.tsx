'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Receipt, FileText, Printer, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Transaction {
  id: string
  transaction_number: string
  payment_method: string
  payment_status: string
  final_amount: number
  created_at: string
  cashier: { full_name: string } | null
  branch: { name: string } | null
  items: { count: number }[]
}

export default function TransactionsClientPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [printingId, setPrintingId] = useState<string | null>(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/admin/transactions')
      const data = await res.json()
      // Filter hanya transaksi paid
      const paidTransactions = (data.transactions || []).filter(
        (tx: Transaction) => tx.payment_status === 'paid'
      )
      setTransactions(paidTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Gagal memuat data transaksi')
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

  const handlePrint = async (transactionId: string) => {
    setPrintingId(transactionId)
    try {
      // Open receipt page in new window with print parameter
      const printWindow = window.open(
        `/dashboard/cashier/receipt/${transactionId}?print=1`,
        '_blank',
        'width=320,height=600'
      )
      
      if (printWindow) {
        printWindow.focus()
      } else {
        toast.error('Popup diblokir. Izinkan popup untuk mencetak struk.')
      }
    } catch (error) {
      console.error('Print error:', error)
      toast.error('Gagal mencetak struk')
    } finally {
      setPrintingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-sm text-gray-600">Daftar transaksi yang sudah lunas</p>
        </div>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-lg">Daftar Transaksi ({transactions.length})</CardTitle>
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
                  <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">Total</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Metode</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600 text-sm">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-pink-500" />
                        <span className="font-mono text-sm font-medium text-pink-600">
                          {tx.transaction_number?.substring(0, 12)}...
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
                    <td className="py-3 px-4 text-right font-medium text-pink-600">
                      {formatCurrency(tx.final_amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="outline" className="text-xs capitalize">
                        {tx.payment_method === 'cash' ? 'Tunai' : tx.payment_method}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/cashier/transactions/${tx.id}`}>
                          <Button variant="ghost" size="sm" title="Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Cetak Struk"
                          onClick={() => handlePrint(tx.id)}
                          disabled={printingId === tx.id}
                        >
                          {printingId === tx.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Printer className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      Belum ada transaksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {transactions.map((tx) => (
          <Card key={tx.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-pink-500" />
                    <span className="font-mono text-sm font-bold text-pink-600">
                      {tx.transaction_number?.substring(0, 12)}...
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(tx.created_at)}</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Lunas</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <p className="text-gray-500 text-xs">Kasir</p>
                  <p className="font-medium">{tx.cashier?.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Metode</p>
                  <Badge variant="outline" className="text-xs capitalize">
                    {tx.payment_method === 'cash' ? 'Tunai' : tx.payment_method}
                  </Badge>
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePrint(tx.id)}
                    disabled={printingId === tx.id}
                  >
                    {printingId === tx.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Printer className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {transactions.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Belum ada transaksi
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
