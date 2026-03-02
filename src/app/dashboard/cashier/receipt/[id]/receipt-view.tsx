'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Printer, ArrowLeft } from 'lucide-react'

interface TransactionItem {
  id: string
  product_name: string | null
  qty: number
  unit_price: number
  subtotal: number
  discount_amount: number
}

interface TransactionPayment {
  id: string
  method: string
  amount: number
}

interface Branch {
  name: string
  address: string
}

interface Cashier {
  full_name: string
}

interface Transaction {
  id: string
  created_at: string
  subtotal_amount: number
  discount_amount: number
  final_amount: number
  payment_method: string
  change_amount: number
  branch: Branch | null
  cashier: Cashier | null
  items: TransactionItem[]
  payments: TransactionPayment[]
}

interface ReceiptViewProps {
  transaction: Transaction
}

export default function ReceiptView({ transaction }: ReceiptViewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }

  return (
    <div className="receipt-page-wrapper min-h-screen bg-gray-100 p-4">
      {/* Controls - Hidden on print */}
      <div className="no-print mb-4 flex items-center gap-4 print:hidden">
        <Link href="/dashboard/cashier/transactions">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <Button onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-2" />
          Cetak Struk
        </Button>
      </div>

      {/* Receipt - 58mm width */}
      <div className="receipt-container bg-white mx-auto p-4 font-mono text-xs shadow-lg">
        {/* Header */}
        <div className="text-center mb-3">
          <div className="font-bold text-sm">{transaction.branch?.name || 'Toko Bonita'}</div>
          <div className="text-[10px]">{transaction.branch?.address || ''}</div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Transaction Info */}
        <div className="mb-2 text-[10px]">
          <div>No: {transaction.id.slice(0, 8)}...</div>
          <div>Tgl: {formatDate(transaction.created_at)}</div>
          <div>Kasir: {transaction.cashier?.full_name || '-'}</div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Items */}
        <div className="mb-2">
          {transaction.items?.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="font-medium text-[11px]">{item.product_name || 'Item'}</div>
              <div className="flex justify-between text-[10px]">
                <span>{item.qty} x {formatCurrency(item.unit_price)}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
              {item.discount_amount > 0 && (
                <div className="text-[10px] text-right text-gray-600">
                  Diskon: -{formatCurrency(item.discount_amount)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Totals */}
        <div className="text-[10px]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(transaction.subtotal_amount)}</span>
          </div>
          {transaction.discount_amount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Diskon</span>
              <span>-{formatCurrency(transaction.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-300 mt-1">
            <span>TOTAL</span>
            <span>{formatCurrency(transaction.final_amount)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Payments */}
        <div className="text-[10px]">
          <div className="font-medium mb-1">Pembayaran:</div>
          {transaction.payments?.map((payment, index) => (
            <div key={index} className="flex justify-between">
              <span className="capitalize">{payment.method}</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
          ))}
          {transaction.payment_method === 'cash' && transaction.change_amount > 0 && (
            <div className="flex justify-between text-gray-600 mt-1">
              <span>Kembalian</span>
              <span>{formatCurrency(transaction.change_amount)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-dashed border-gray-400 my-2"></div>

        {/* Footer */}
        <div className="text-center text-[10px]">
          <div>================================</div>
          <div className="mt-1">Terima kasih telah berbelanja</div>
          <div>di Toko Bonita</div>
          <div className="mt-1 text-gray-600">Kecantikan & Perlengkapan Bayi</div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Hide everything except receipt */
          body {
            background: white !important;
          }
          
          /* Hide dashboard elements */
          aside,
          nav,
          header,
          .sidebar,
          [class*="Sidebar"],
          [class*="Header"],
          .no-print,
          .lg\:pl-64 {
            display: none !important;
          }
          
          /* Receipt container styles for print */
          .receipt-page-wrapper {
            padding: 0 !important;
            background: white !important;
          }
          
          .receipt-container {
            width: 58mm !important;
            padding: 2mm !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
