'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

type Branch = Tables<'branches'>

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchData = async () => {
    const res = await fetch('/api/admin/branches')
    const data = await res.json()
    if (data.data) {
      setBranches(data.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    startTransition(() => {
      void fetchData()
    })
  }, [])

  const handleDelete = async (branch: Branch) => {
    if (!confirm(`Hapus cabang "${branch.name}"?`)) return

    setDeleting(branch.id)
    try {
      const res = await fetch(`/api/admin/branches?id=${branch.id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal menghapus')
      }

      toast.success('Cabang berhasil dihapus')
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
          <h1 className="text-2xl font-bold text-gray-900">Kelola Cabang</h1>
          <p className="text-gray-600">Daftar semua cabang toko</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-600">
          <Link href="/dashboard/admin/branches/new">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Cabang
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead className="text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches?.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.address || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" disabled>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDelete(branch)}
                        disabled={deleting === branch.id}
                      >
                        {deleting === branch.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!branches || branches.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    Belum ada cabang
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
