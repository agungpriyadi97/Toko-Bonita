'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { Tables } from '@/types/database.types'

type Profile = Tables<'profiles'> & {
  branch?: { name: string } | null
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchData = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    if (data.data) {
      setProfiles(data.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    startTransition(() => {
      void fetchData()
    })
  }, [])

  const handleDelete = async (profile: Profile) => {
    if (!confirm(`Hapus pengguna "${profile.full_name}"?`)) return

    setDeleting(profile.id)
    try {
      const res = await fetch(`/api/admin/users?id=${profile.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus')
      }

      toast.success('Pengguna berhasil dihapus')
      startTransition(() => {
        void fetchData()
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus')
    } finally {
      setDeleting(null)
    }
  }

  if (loading || isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>
          <p className="text-gray-600">Daftar semua pengguna sistem</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-600">
          <Link href="/dashboard/admin/users/new">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pengguna
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles?.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role === 'admin' ? 'Admin' : 'Kasir'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" disabled>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(profile)}
                        disabled={deleting === profile.id}
                      >
                        {deleting === profile.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!profiles || profiles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    Belum ada pengguna
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
