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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="receipt-page">
      {/* Tombol Kontrol - Tersembunyi saat print */}
      <div className="print-buttons mb-4 flex items-center gap-4">
        <Link href="/dashboard/cashier/transactions">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Cetak Struk
        </Button>
      </div>

      {/* Struk */}
      <div className="receipt">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{transaction.branch?.name || 'Toko Bonita'}</div>
          <div style={{ fontSize: '10px' }}>{transaction.branch?.address || 'Kecantikan & Perlengkapan Bayi'}</div>
        </div>

        <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }}></div>

        {/* Info Transaksi */}
        <div style={{ fontSize: '10px', marginBottom: '8px' }}>
          <div>No: {transaction.transaction_number || transaction.id.slice(0, 12)}</div>
          <div>Tgl: {formatDate(transaction.created_at)}</div>
          <div>Kasir: {transaction.cashier?.full_name || '-'}</div>
        </div>

        <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }}></div>

        {/* Items */}
        <div style={{ marginBottom: '8px' }}>
          {transaction.items?.map((item, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              <div style={{ fontWeight: '500' }}>{item.product_name || 'Item'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <span>{item.qty} x {formatCurrency(item.unit_price)}</span>
                <span>{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }}></div>

        {/* Totals */}
        <div style={{ fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal</span>
            <span>{formatCurrency(transaction.subtotal_amount)}</span>
          </div>
          {transaction.discount_amount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Diskon</span>
              <span>-{formatCurrency(transaction.discount_amount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px', borderTop: '1px solid #ccc', marginTop: '4px', paddingTop: '4px' }}>
            <span>TOTAL</span>
            <span>{formatCurrency(transaction.final_amount)}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }}></div>

        {/* Pembayaran */}
        <div style={{ fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bayar ({transaction.payment_method === 'cash' ? 'Tunai' : transaction.payment_method})</span>
            <span>{formatCurrency(transaction.cash_received || transaction.final_amount)}</span>
          </div>
          {transaction.change_amount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Kembalian</span>
              <span>{formatCurrency(transaction.change_amount)}</span>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px dashed #999', margin: '8px 0' }}></div>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: '10px' }}>
          <div>================================</div>
          <div style={{ marginTop: '4px' }}>Terima kasih telah berbelanja</div>
          <div>di Toko Bonita</div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        .receipt-page {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 16px;
        }

        .receipt {
          background: white;
          width: 80mm;
          max-width: 100%;
          margin: 0 auto;
          padding: 8px;
          font-family: monospace;
          font-size: 11px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        @media print {
          /* Hide everything first */
          body * {
            visibility: hidden;
          }

          /* Show only receipt page and its children */
          .receipt-page,
          .receipt-page * {
            visibility: visible;
          }

          /* Position receipt at top-left */
          .receipt-page {
            position: absolute;
            left: 0;
            top: 0;
            padding: 0;
            margin: 0;
            background: white;
          }

          .print-buttons {
            display: none !important;
          }

          .receipt {
            box-shadow: none;
            margin: 0;
            padding: 4mm;
            width: 80mm;
          }

          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}
