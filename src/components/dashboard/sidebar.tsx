'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Tags,
  Users,
  BarChart3,
  Building2,
  Warehouse,
  ArrowLeftRight,
  Settings2,
  LogOut,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Tables } from '@/types/database.types'

interface SidebarProps {
  profile: Tables<'profiles'> | null
  onLogout: () => void
  isOpen?: boolean
  onClose?: () => void
}

const adminLinks = [
  { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Produk', href: '/dashboard/admin/products', icon: Package },
  { name: 'Kategori', href: '/dashboard/admin/categories', icon: Tags },
  { name: 'Pengguna', href: '/dashboard/admin/users', icon: Users },
  { name: 'Pesanan', href: '/dashboard/admin/orders', icon: ShoppingCart },
  { name: 'Transaksi', href: '/dashboard/admin/transactions', icon: Receipt },
  { name: 'Laporan', href: '/dashboard/admin/reports', icon: BarChart3 },
  { name: 'Cabang', href: '/dashboard/admin/branches', icon: Building2 },
  { name: 'Gudang', href: '/dashboard/admin/warehouses', icon: Warehouse },
  { name: 'Penyesuaian Stok', href: '/dashboard/admin/stock/adjust', icon: Settings2 },
  { name: 'Transfer Stok', href: '/dashboard/admin/stock/transfer', icon: ArrowLeftRight },
]

const cashierLinks = [
  { name: 'Kasir (POS)', href: '/dashboard/cashier', icon: ShoppingCart },
  { name: 'Pesanan', href: '/dashboard/cashier/orders', icon: Package },
  { name: 'Transaksi', href: '/dashboard/cashier/transactions', icon: Receipt },
]

export function Sidebar({ profile, onLogout, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'
  const links = isAdmin ? adminLinks : cashierLinks

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={cn(
        "flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 overflow-y-auto",
        // Desktop: fixed sidebar
        "lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64",
        // Mobile: slide-over
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Toko Bonita
            </span>
          </Link>
          {/* Mobile close button */}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2">
          <nav className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== '/dashboard/admin' && link.href !== '/dashboard/cashier' && 
                 pathname.startsWith(link.href))
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-pink-100 text-pink-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <link.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-pink-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User info & Logout */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role || 'cashier'}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  )
}
