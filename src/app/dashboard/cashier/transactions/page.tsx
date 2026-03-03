import { createClient } from '@/lib/supabase'
import { getUser } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye, Receipt, FileText } from 'lucide-react'

export const revalidate = 5 // Revalidate every 5 seconds

export default async function TransactionsPage() {
  const user = await getUser()
  const supabase = await createClient()

  // Simplified query - only select needed columns
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id,
      transaction_number,
      payment_method,
      payment_status,
      final_amount,
      created_at,
      cashier:profiles!transactions_cashier_id_fkey(full_name),
      branch:branches(name),
      items:transaction_items(count)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Riwayat Transaksi</h1>
          <p className="text-sm text-gray-600">Daftar semua transaksi</p>
        </div>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
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
                {transactions?.map((tx) => (
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
                {(!transactions || transactions.length === 0) && (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
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
        {transactions?.map((tx) => (
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
        {(!transactions || transactions.length === 0) && (
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
