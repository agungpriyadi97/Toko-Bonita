import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Printer, FileText } from 'lucide-react'

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: transaction } = await supabase
    .from('transactions')
    .select(`
      *,
      cashier:profiles!transactions_cashier_id_fkey(full_name),
      branch:branches(name, address),
      warehouse:warehouses(name),
      items:transaction_items(
        *,
        product:products(name)
      ),
      payments:transaction_payments(*)
    `)
    .eq('id', id)
    .single()

  if (!transaction) {
    notFound()
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
      dateStyle: 'full',
      timeStyle: 'long',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/cashier/transactions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Detail Transaksi</h1>
            <div className="flex items-center gap-2 mt-1">
              <FileText className="h-4 w-4 text-pink-500" />
              <span className="font-mono text-sm font-bold text-pink-600">
                {transaction.transaction_number || transaction.id}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(transaction.payment_status)}>
            {transaction.payment_status === 'paid' ? 'Lunas' : 'Pending'}
          </Badge>
          <Link href={`/dashboard/cashier/receipt/${id}`} target="_blank">
            <Button variant="outline" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0">
              <Printer className="h-4 w-4 mr-2" />
              Cetak Struk
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Transaction Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium">{formatDate(transaction.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kasir</p>
              <p className="font-medium">{transaction.cashier?.full_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cabang</p>
              <p className="font-medium">{transaction.branch?.name}</p>
              <p className="text-sm text-gray-500">{transaction.branch?.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gudang</p>
              <p className="font-medium">{transaction.warehouse?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Metode Pembayaran</p>
              <Badge variant="outline" className="capitalize">
                {transaction.payment_method}
              </Badge>
            </div>
            {transaction.notes && (
              <div>
                <p className="text-sm text-gray-500">Catatan</p>
                <p className="font-medium">{transaction.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transaction.payments?.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{payment.method}</p>
                    {payment.reference && (
                      <p className="text-sm text-gray-500">Ref: {payment.reference}</p>
                    )}
                  </div>
                  <p className="font-medium">{formatCurrency(payment.amount)}</p>
                </div>
              ))}
              
              {transaction.payment_method === 'cash' && (
                <>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span>Uang Diterima</span>
                    <span>{formatCurrency(transaction.cash_received)}</span>
                  </div>
                  {transaction.change_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Kembalian</span>
                      <span>{formatCurrency(transaction.change_amount)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(transaction.subtotal_amount)}</span>
              </div>
              {transaction.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Diskon</span>
                  <span>-{formatCurrency(transaction.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-pink-600">{formatCurrency(transaction.final_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Item Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Produk</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Harga</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Qty</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Subtotal</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Diskon</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items?.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3 px-4">
                      <p className="font-medium">{item.product?.name || 'Produk dihapus'}</p>
                    </td>
                    <td className="py-3 px-4 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 px-4 text-center">{item.qty}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(item.subtotal)}</td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {item.discount_amount > 0 ? `-${formatCurrency(item.discount_amount)}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{formatCurrency(item.final_subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
