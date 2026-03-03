'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  X, 
  Check, 
  ShoppingCart, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'new_order' | 'transaction_completed' | 'low_stock' | 'system'
  title: string
  message: string
  data: Record<string, unknown>
  is_read: boolean
  created_at: string
}

interface NotificationDropdownProps {
  userId?: string
  userRole?: string
}

const notificationIcons = {
  new_order: ShoppingCart,
  transaction_completed: CheckCircle,
  low_stock: AlertTriangle,
  system: Info,
}

const notificationColors = {
  new_order: 'bg-blue-500',
  transaction_completed: 'bg-green-500',
  low_stock: 'bg-yellow-500',
  system: 'bg-gray-500',
}

export function NotificationDropdown({ userId, userRole }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?limit=20')
      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Check for low stock and create notifications
  const checkLowStock = async () => {
    try {
      await fetch('/api/stock-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: 5 })
      })
    } catch (error) {
      console.error('Error checking low stock:', error)
    }
  }

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications()
    // Check for low stock on initial load
    checkLowStock()
    // Poll every 30 seconds for new notifications
    const interval = setInterval(() => {
      fetchNotifications()
      checkLowStock()
    }, 30000)
    return () => clearInterval(interval)
  }, [userId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mark as read
  const markAsRead = async (ids: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      })
      setNotifications(prev => 
        prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - ids.length))
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true })
      })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setLoading(false)
    }
  }

  // Clear all notifications
  const clearAll = async () => {
    setLoading(true)
    try {
      await fetch('/api/notifications?all=true', { method: 'DELETE' })
      setNotifications([])
      setUnreadCount(0)
    } catch (error) {
      console.error('Error clearing notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Format time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: id 
      })
    } catch {
      return ''
    }
  }

  // Handle notification click - navigate to relevant page
  const handleNotificationClick = async (notification: Notification) => {
    // Close dropdown immediately
    setIsOpen(false)

    // Mark as read in background (don't wait)
    if (!notification.is_read) {
      markAsRead([notification.id])
    }

    // Navigate based on notification type
    const data = notification.data as Record<string, unknown>
    
    switch (notification.type) {
      case 'low_stock':
        if (data.product_id && userRole === 'admin') {
          router.push(`/dashboard/admin/products?highlight=${data.product_id}`)
        }
        break
        
      case 'new_order':
        router.push('/dashboard/cashier/orders')
        break
        
      case 'transaction_completed':
        if (data.transaction_id) {
          router.push(`/dashboard/cashier/transactions/${data.transaction_id}`)
        } else {
          router.push('/dashboard/cashier/transactions')
        }
        break
        
      default:
        break
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-0"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:right-0 top-16 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white rounded-lg shadow-lg border z-50 overflow-hidden max-h-[80vh] sm:max-h-none flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50 flex-shrink-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifikasi</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={markAllAsRead}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3 mr-0 sm:mr-1" />
                  )}
                  <span className="hidden sm:inline">Tandai dibaca</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-red-600 hover:text-red-700"
                onClick={clearAll}
                disabled={loading || notifications.length === 0}
              >
                <Trash2 className="h-3 w-3 mr-0 sm:mr-1" />
                <span className="hidden sm:inline">Hapus semua</span>
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Bell className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Tidak ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Info
                  const colorClass = notificationColors[notification.type] || 'bg-gray-500'
                  const hasLink = notification.type === 'low_stock' || 
                                  notification.type === 'new_order' || 
                                  notification.type === 'transaction_completed'
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-gray-50 cursor-pointer transition-colors group",
                        !notification.is_read && "bg-blue-50/50"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              "text-sm font-medium flex items-center gap-1",
                              !notification.is_read && "text-gray-900",
                              notification.is_read && "text-gray-600"
                            )}>
                              {notification.title}
                              {hasLink && (
                                <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-pink-500 transition-colors" />
                              )}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
