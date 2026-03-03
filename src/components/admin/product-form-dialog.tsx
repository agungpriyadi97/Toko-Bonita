'use client'

import { useState, useEffect, useSyncExternalStore, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { getSupabaseClient } from '@/lib/supabase-client'
import type { Tables } from '@/types/database.types'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Tables<'products'> | null
  onSuccess: () => void
}

const emptySubscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function ProductFormDialog({ open, onOpenChange, product, onSuccess }: ProductFormDialogProps) {
  const [categories, setCategories] = useState<Tables<'categories'>[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    barcode: '',
    sku: '',
    price: '',
    description: '',
    is_active: true,
    image_url: ''
  })
  const mounted = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot)
  const supabase = getSupabaseClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      setCategories(data || [])
    }
    fetchCategories()
  }, [supabase])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category_id: product.category_id || '',
        barcode: product.barcode || '',
        sku: product.sku || '',
        price: product.price.toString(),
        description: product.description || '',
        is_active: product.is_active,
        image_url: (product as any).image_url || ''
      })
    } else {
      setFormData({
        name: '',
        category_id: '',
        barcode: '',
        sku: '',
        price: '',
        description: '',
        is_active: true,
        image_url: ''
      })
    }
  }, [product])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipe file tidak valid. Gunakan JPG, PNG, atau WEBP')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 5MB')
      return
    }

    setUploadingImage(true)

    try {
      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        setFormData({ ...formData, image_url: base64 })
        setUploadingImage(false)
      }
      reader.onerror = () => {
        toast.error('Gagal membaca file')
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Gagal mengupload gambar')
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image_url: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const checkDuplicate = async (field: string, value: string): Promise<boolean> => {
    if (!value.trim()) return false
    
    let query = supabase
      .from('products')
      .select('id')
      .eq(field, value.trim())
    
    // Exclude current product when editing
    if (product) {
      query = query.neq('id', product.id)
    }
    
    const { data } = await query.maybeSingle()
    return !!data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price) {
      toast.error('Nama dan harga wajib diisi')
      return
    }

    setLoading(true)

    try {
      // Check for duplicates
      const duplicateErrors: string[] = []
      
      // Check name duplicate
      if (await checkDuplicate('name', formData.name)) {
        duplicateErrors.push(`Nama produk "${formData.name}" sudah ada`)
      }
      
      // Check barcode duplicate (only if filled)
      if (formData.barcode && await checkDuplicate('barcode', formData.barcode)) {
        duplicateErrors.push(`Barcode "${formData.barcode}" sudah digunakan`)
      }
      
      // Check SKU duplicate (only if filled)
      if (formData.sku && await checkDuplicate('sku', formData.sku)) {
        duplicateErrors.push(`SKU "${formData.sku}" sudah digunakan`)
      }

      // Show duplicate errors and stop
      if (duplicateErrors.length > 0) {
        toast.error(
          <div className="space-y-1">
            <p className="font-semibold">Data sudah ada:</p>
            {duplicateErrors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>,
          { duration: 5000 }
        )
        setLoading(false)
        return
      }

      const slug = generateSlug(formData.name)
      const price = parseFloat(formData.price) || 0

      // Build product data - only include image_url if it has value
      const productData: Record<string, any> = {
        name: formData.name,
        slug,
        category_id: formData.category_id || null,
        barcode: formData.barcode || null,
        sku: formData.sku || null,
        price,
        description: formData.description || null,
        is_active: formData.is_active,
      }

      // Only add image_url if it's not empty
      if (formData.image_url) {
        productData.image_url = formData.image_url
      }

      if (product) {
        // Update existing product
        productData.updated_at = new Date().toISOString()
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) {
          console.error('Update error:', error)
          // Handle duplicate key error from database
          if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
            toast.error('Data sudah ada: nama, barcode, atau SKU sudah digunakan produk lain')
          } else if (error.message && error.message.includes('image_url')) {
            delete productData.image_url
            const { error: retryError } = await supabase
              .from('products')
              .update(productData)
              .eq('id', product.id)
            if (retryError) throw retryError
            toast.success('Produk berhasil diperbarui (tanpa gambar)')
          } else {
            throw error
          }
        } else {
          toast.success('Produk berhasil diperbarui')
        }
      } else {
        // Create new product
        productData.in_stock = true
        const { error } = await supabase
          .from('products')
          .insert(productData)

        if (error) {
          console.error('Insert error:', error)
          // Handle duplicate key error from database
          if (error.code === '23505' || error.message.includes('duplicate') || error.message.includes('unique')) {
            toast.error('Data sudah ada: nama, barcode, atau SKU sudah digunakan produk lain')
          } else if (error.message && error.message.includes('image_url')) {
            delete productData.image_url
            const { error: retryError } = await supabase
              .from('products')
              .insert(productData)
            if (retryError) throw retryError
            toast.success('Produk berhasil ditambahkan (tanpa gambar)')
          } else {
            throw error
          }
        } else {
          toast.success('Produk berhasil ditambahkan')
        }
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving product:', error)
      toast.error(error?.message || 'Gagal menyimpan produk')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Edit Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label>Gambar Produk</Label>
            <div className="mt-2">
              {formData.image_url ? (
                <div className="relative inline-block">
                  <img
                    src={formData.image_url}
                    alt="Product"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-colors">
                  {uploadingImage ? (
                    <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">Klik untuk upload gambar</span>
                      <span className="text-xs text-gray-400">JPG, PNG, WEBP (max 5MB)</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Masukkan nama produk"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={formData.category_id}
              onValueChange={(v) => setFormData({ ...formData, category_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="899xxxxx"
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="PRD-001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="price">Harga (Rp) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="50000"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi produk"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Produk aktif</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-purple-600"
              disabled={loading || uploadingImage}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {product ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
