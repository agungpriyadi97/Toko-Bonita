import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  // Fetch statistics
  const [
    { count: totalProducts },
    { count: totalCategories },
    { count: totalUsers },
    { data: todayTransactions }
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('transactions')
      .select('final_amount')
      .gte('created_at', todayISO)
      .eq('payment_status', 'paid')
  ])

  const todayRevenue = todayTransactions?.reduce((sum, t) => sum + Number(t.final_amount), 0) || 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const stats = [
    {
      title: 'Pendapatan Hari Ini',
      value: formatCurrency(todayRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Produk',
      value: totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Kategori',
      value: totalCategories || 0,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Pengguna',
      value: totalUsers || 0,
      icon: Users,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang di panel admin Toko Bonita</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/dashboard/admin/products"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Package className="h-5 w-5 mr-3 text-blue-600" />
              <span className="font-medium">Kelola Produk</span>
            </a>
            <a
              href="/dashboard/admin/categories"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingBag className="h-5 w-5 mr-3 text-purple-600" />
              <span className="font-medium">Kelola Kategori</span>
            </a>
            <a
              href="/dashboard/admin/users"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="h-5 w-5 mr-3 text-pink-600" />
              <span className="font-medium">Kelola Pengguna</span>
            </a>
            <a
              href="/dashboard/admin/reports"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <DollarSign className="h-5 w-5 mr-3 text-green-600" />
              <span className="font-medium">Lihat Laporan</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
