import { createClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import ReceiptView from './receipt-view'

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
  transaction_number: string
  created_at: string
  subtotal_amount: number
  discount_amount: number
  final_amount: number
  payment_method: string
  cash_received: number
  change_amount: number
  branch: Branch | null
  cashier: Cashier | null
  items: TransactionItem[]
  payments: TransactionPayment[]
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: transaction } = await supabase
    .from('transactions')
    .select(`
      id,
      transaction_number,
      created_at,
      subtotal_amount,
      discount_amount,
      final_amount,
      payment_method,
      cash_received,
      change_amount,
      cashier:profiles!transactions_cashier_id_fkey(full_name),
      branch:branches(name, address),
      items:transaction_items(
        qty,
        unit_price,
        subtotal,
        discount_amount,
        product:products(name)
      ),
      payments:transaction_payments(method, amount)
    `)
    .eq('id', id)
    .single()

  if (!transaction) {
    notFound()
  }

  // Transform items to flatten product name
  const transformedTransaction = {
    ...transaction,
    items: (transaction.items || []).map((item: { qty: number; unit_price: number; subtotal: number; discount_amount: number; product?: { name: string } | null }) => ({
      product_name: item.product?.name || 'Produk tidak dikenal',
      qty: item.qty,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      discount_amount: item.discount_amount
    }))
  }

  return <ReceiptView transaction={transformedTransaction as Transaction} />
}
