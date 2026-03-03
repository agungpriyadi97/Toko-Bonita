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
      *,
      cashier:profiles!transactions_cashier_id_fkey(full_name),
      branch:branches(name, address),
      items:transaction_items(*),
      payments:transaction_payments(*)
    `)
    .eq('id', id)
    .single()

  if (!transaction) {
    notFound()
  }

  return <ReceiptView transaction={transaction as Transaction} />
}
