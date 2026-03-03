'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Tables } from '@/types/database.types'

export default function NewWarehousePage() {
  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState<Tables<'branches'>[]>([])
  const [formData, setFormData] = useState({
    name: '',
    branch_id: ''
  })
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const fetchBranches = async () => {
      const { data } = await supabase
        .from('branches')
        .select('*')
        .order('name')
      setBranches(data || [])
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, branch_id: data[0].id }))
      }
    }
    fetchBranches()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.branch_id) {
      toast.error('Nama dan cabang wajib diisi')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat gudang')
      }

      toast.success('Gudang berhasil ditambahkan')
      router.push('/dashboard/admin/warehouses')
    } catch (error) {
      console.error('Error creating warehouse:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal membuat gudang')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/warehouses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Gudang Baru</h1>
          <p className="text-gray-600">Buat gudang baru</p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Informasi Gudang</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Gudang *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Gudang Utama"
                required
              />
            </div>

            <div>
              <Label htmlFor="branch_id">Cabang *</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(v) => setFormData({ ...formData, branch_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih cabang" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-pink-500 to-purple-600"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Simpan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
