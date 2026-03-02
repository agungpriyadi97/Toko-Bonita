'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewBranchPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: ''
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast.error('Nama cabang wajib diisi')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat cabang')
      }

      toast.success('Cabang berhasil ditambahkan')
      router.push('/dashboard/admin/branches')
    } catch (error) {
      console.error('Error creating branch:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal membuat cabang')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin/branches">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tambah Cabang Baru</h1>
          <p className="text-gray-600">Buat cabang toko baru</p>
        </div>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Informasi Cabang</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Cabang *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Toko Bonita Mall"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Alamat lengkap"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telepon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="021-xxxxxxx"
              />
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
