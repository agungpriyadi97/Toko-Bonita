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
  transaction_number?: string
  created_at: string
  subtotal_amount: number
  discount_amount: number
  final_amount: number
  payment_method: string
  cash_received?: number
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
    <>
      {/* Screen View - dengan dashboard layout */}
      <div className="screen-view min-h-screen bg-gray-100 p-4">
        {/* Controls - Hidden on print */}
        <div className="print-controls mb-4 flex items-center gap-4">
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

        {/* Receipt Preview */}
        <div className="receipt-preview bg-white mx-auto p-4 font-mono text-xs shadow-lg" style={{ width: '80mm', fontSize: '11px' }}>
          {/* Header */}
          <div className="text-center mb-2">
            <div className="font-bold text-sm">{transaction.branch?.name || 'Toko Bonita'}</div>
            <div className="text-[10px]">{transaction.branch?.address || 'Kecantikan & Perlengkapan Bayi'}</div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Transaction Info */}
          <div className="mb-2 text-[10px]">
            <div>No: {transaction.transaction_number || transaction.id.slice(0, 12)}</div>
            <div>Tgl: {formatDate(transaction.created_at)}</div>
            <div>Kasir: {transaction.cashier?.full_name || '-'}</div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Items */}
          <div className="mb-2">
            {transaction.items?.map((item, index) => (
              <div key={index} className="mb-1">
                <div className="font-medium">{item.product_name || 'Item'}</div>
                <div className="flex justify-between">
                  <span>{item.qty} x {formatCurrency(item.unit_price)}</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Totals */}
          <div className="text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(transaction.subtotal_amount)}</span>
            </div>
            {transaction.discount_amount > 0 && (
              <div className="flex justify-between">
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

          {/* Payment */}
          <div className="text-[11px]">
            <div className="flex justify-between">
              <span>Bayar ({transaction.payment_method === 'cash' ? 'Tunai' : transaction.payment_method})</span>
              <span>{formatCurrency(transaction.cash_received || transaction.final_amount)}</span>
            </div>
            {transaction.change_amount > 0 && (
              <div className="flex justify-between">
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
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Reset semua */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            width: 80mm !important;
            min-width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-size: 11px !important;
          }
          
          /* Sembunyikan SEMUA elemen dashboard */
          body > div:first-child:not(.screen-view),
          .lg\\:pl-64,
          aside,
          nav,
          header,
          .sidebar,
          [class*="Sidebar"],
          [class*="Header"],
          [class*="sidebar"],
          [class*="header"],
          [data-sidebar],
          header nav,
          .sticky,
          .print-controls {
            display: none !important;
          }
          
          /* Tampilkan hanya screen-view dan receipt */
          .screen-view {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            min-height: auto !important;
          }
          
          .receipt-preview {
            width: 80mm !important;
            min-width: 80mm !important;
            max-width: 80mm !important;
            padding: 3mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            font-size: 11px !important;
            background: white !important;
          }
          
          /* Page setup */
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </>
  )
}
