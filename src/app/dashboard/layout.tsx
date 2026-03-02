'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase-client'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Loader2 } from 'lucide-react'
import type { Tables } from '@/types/database.types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (!mounted) return

        if (authError || !user) {
          // Not logged in, redirect to login
          window.location.href = '/auth/login'
          return
        }

        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!mounted) return

        if (profileError) {
          // Profile doesn't exist, create one based on user metadata
          if (profileError.code === 'PGRST116') {
            const role = user.user_metadata?.role || 'cashier'
            const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: fullName,
                role: role
              })
              .select()
              .single()

            if (!mounted) return

            if (createError) {
              setError('Gagal membuat profil pengguna')
              setLoading(false)
              return
            }

            setProfile(newProfile)
            setLoading(false)
            return
          }
          
          setError('Gagal memuat profil')
          setLoading(false)
          return
        }

        setProfile(profileData)
        setLoading(false)
      } catch (err) {
        if (!mounted) return
        setError('Terjadi kesalahan')
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/auth/login'
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        <p className="text-gray-600">Memuat...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.href = '/auth/login'}
          className="text-pink-600 hover:underline"
        >
          Kembali ke Login
        </button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        <p className="text-gray-600">Memuat profil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar 
        profile={profile} 
        onLogout={handleLogout} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64">
        <Header 
          profile={profile} 
          onLogout={handleLogout}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
