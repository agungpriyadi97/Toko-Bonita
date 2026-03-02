import TransactionsClientPage from './TransactionsClient'

export const revalidate = 5 // Revalidate every 5 seconds

export default function TransactionsPage() {
  return <TransactionsClientPage />
}
