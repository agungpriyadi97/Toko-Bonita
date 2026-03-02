'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  ShoppingCart, 
  CheckCircle,
  Loader2,
  Package,
  Upload,
  X,
  Image as ImageIcon,
  CreditCard,
  QrCode,
  Wallet,
  Building2,
  Truck
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  image_url?: string | null
  sku?: string | null
  category?: {
    name: string
  } | null
}

interface ProductPurchaseDialogProps {
  product: Product
}

type PaymentMethod = 'cash' | 'transfer' | 'qris' | 'debit'
type ShippingMethod = 'pickup' | 'jne' | 'jnt' | 'sicepat' | 'pos' | 'gosend' | 'grab'
type Step = 'order' | 'payment' | 'success'

const paymentMethods = [
  { id: 'transfer' as PaymentMethod, name: 'Transfer Bank', icon: Building2, description: 'BCA, Mandiri, BNI, BRI' },
  { id: 'qris' as PaymentMethod, name: 'QRIS', icon: QrCode, description: 'Scan QR untuk bayar' },
  { id: 'cash' as PaymentMethod, name: 'Tunai', icon: Wallet, description: 'Bayar di toko' },
  { id: 'debit' as PaymentMethod, name: 'Kartu Debit', icon: CreditCard, description: 'Bayar dengan kartu' },
]

const shippingMethods = [
  { id: 'pickup' as ShippingMethod, name: 'Ambil di Toko', icon: Package, description: 'Gratis', cost: 0 },
  { id: 'jne' as ShippingMethod, name: 'JNE', icon: Truck, description: 'Reguler/YES', cost: 15000 },
  { id: 'jnt' as ShippingMethod, name: 'J&T Express', icon: Truck, description: 'Reguler/EZ', cost: 12000 },
  { id: 'sicepat' as ShippingMethod, name: 'SiCepat', icon: Truck, description: 'REG/BEST', cost: 13000 },
  { id: 'pos' as ShippingMethod, name: 'POS Indonesia', icon: Truck, description: 'Paket Pos', cost: 10000 },
  { id: 'gosend' as ShippingMethod, name: 'GoSend', icon: Truck, description: 'Same Day/Instant', cost: 25000 },
  { id: 'grab' as ShippingMethod, name: 'Grab Express', icon: Truck, description: 'Same Day/Instant', cost: 25000 },
]

export function ProductPurchaseDialog({ product }: ProductPurchaseDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('order')
  const [quantity, setQuantity] = useState(1)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('pickup')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const selectedShipping = shippingMethods.find(s => s.id === shippingMethod) || shippingMethods[0]
  const shippingCost = selectedShipping.cost
  const totalPrice = product.price * quantity + shippingCost

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    setPaymentProof(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPaymentProofPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeFile = () => {
    setPaymentProof(null)
    setPaymentProofPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Mohon isi nama Anda')
      return
    }
    if (!customerPhone.trim()) {
      toast.error('Mohon isi nomor telepon')
      return
    }
    if (shippingMethod !== 'pickup' && !customerAddress.trim()) {
      toast.error('Mohon isi alamat pengiriman')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_address: customerAddress,
          notes,
          payment_method: paymentMethod,
          shipping_method: shippingMethod,
          shipping_cost: shippingCost,
          items: [{
            product_id: product.id,
            product_name: product.name,
            product_sku: product.sku,
            quantity,
            unit_price: product.price
          }]
        })
      })

      const data = await response.json()

      if (data.success) {
        setOrderId(data.order?.id || '')
        setOrderNumber(data.order?.order_number || '')
        
        // Create notification for new order
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'new_order',
              title: 'Pesanan Baru',
              message: `Pesanan dari ${customerName} untuk ${product.name} (${quantity}x) - ${formatPrice(totalPrice)}`,
              data: {
                order_id: data.order?.id,
                order_number: data.order?.order_number,
                product_id: product.id,
                product_name: product.name,
                quantity,
                total_price: totalPrice,
                customer_name: customerName,
                customer_phone: customerPhone
              }
            })
          })
        } catch (notifError) {
          console.log('Could not create notification:', notifError)
        }

        // Move to payment step
        setStep('payment')
      } else {
        throw new Error(data.error || 'Gagal membuat pesanan')
      }
      
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal mengirim pesanan')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadPayment = async () => {
    if (paymentMethod !== 'cash' && !paymentProof) {
      toast.error('Mohon upload bukti pembayaran')
      return
    }

    setLoading(true)
    
    try {
      if (paymentProof) {
        const formData = new FormData()
        formData.append('file', paymentProof)
        formData.append('orderId', orderId)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        const uploadData = await uploadResponse.json()

        if (!uploadData.success) {
          throw new Error(uploadData.error || 'Gagal upload bukti pembayaran')
        }
      } else {
        // For cash payment, just update the order
        await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: orderId, 
            payment_method: paymentMethod,
            payment_status: 'pending'
          })
        })
      }

      // Create notification for payment
      try {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'transaction_completed',
            title: 'Bukti Pembayaran Diterima',
            message: `Bukti pembayaran untuk pesanan ${orderNumber} telah diupload`,
            data: {
              order_id: orderId,
              order_number: orderNumber,
              payment_method: paymentMethod
            }
          })
        })
      } catch (notifError) {
        console.log('Could not create notification:', notifError)
      }

      setStep('success')
      toast.success('Pesanan berhasil dikirim!')
      
    } catch (error) {
      console.error('Error uploading payment:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal mengupload bukti pembayaran')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setQuantity(1)
    setCustomerName('')
    setCustomerPhone('')
    setCustomerAddress('')
    setNotes('')
    setStep('order')
    setOrderId('')
    setOrderNumber('')
    setPaymentMethod('transfer')
    setPaymentProof(null)
    setPaymentProofPreview(null)
    setShippingMethod('pickup')
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Beli Sekarang
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2 text-lg">
            {step === 'success' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>Pesanan Berhasil!</span>
              </>
            ) : step === 'payment' ? (
              <>
                <CreditCard className="h-5 w-5 text-pink-500 flex-shrink-0" />
                <span>Pembayaran</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 text-pink-500 flex-shrink-0" />
                <span>Beli Produk</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {step === 'success' 
              ? 'Pesanan Anda telah kami terima.'
              : step === 'payment'
              ? `Order: ${orderNumber} - Total: ${formatPrice(totalPrice)}`
              : 'Isi data berikut untuk melakukan pemesanan'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'success' ? (
          <div className="py-4 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-500">Nomor Pesanan</p>
              <p className="text-lg font-bold text-gray-900">{orderNumber}</p>
            </div>
            <p className="text-gray-600 mb-3 text-sm">
              Terima kasih, <span className="font-medium">{customerName}</span>! 
            </p>
            <p className="text-sm text-gray-500">
              {paymentMethod === 'cash' 
                ? 'Silakan bayar di kasir toko kami.'
                : 'Bukti pembayaran Anda sedang diverifikasi oleh kasir.'
              }
            </p>
          </div>
        ) : step === 'payment' ? (
          <div className="space-y-3">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-pink-600">{formatPrice(totalPrice)}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {orderNumber}
                </Badge>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Metode Pembayaran</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = paymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all",
                        isSelected 
                          ? "border-pink-500 bg-pink-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-5 w-5 flex-shrink-0", isSelected ? "text-pink-500" : "text-gray-400")} />
                        <div className="min-w-0">
                          <p className={cn("font-medium text-sm", isSelected && "text-pink-700")}>
                            {method.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Bank Info for Transfer */}
            {paymentMethod === 'transfer' && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="font-medium text-blue-800 mb-2">Informasi Rekening:</p>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>BCA:</strong> 1234567890 a.n. Toko Bonita</p>
                  <p><strong>Mandiri:</strong> 0987654321 a.n. Toko Bonita</p>
                  <p className="text-xs mt-2 text-blue-600">
                    * Transfer sesuai total, lalu upload bukti transfer
                  </p>
                </div>
              </div>
            )}

            {/* QRIS Info */}
            {paymentMethod === 'qris' && (
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="w-24 h-24 bg-white border-2 border-dashed border-purple-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-purple-300" />
                </div>
                <p className="text-sm text-purple-700">
                  Scan QR di atas untuk pembayaran
                </p>
              </div>
            )}

            {/* Payment Proof Upload */}
            {paymentMethod !== 'cash' && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Bukti Pembayaran *</Label>
                
                {paymentProofPreview ? (
                  <div className="relative">
                    <img 
                      src={paymentProofPreview} 
                      alt="Bukti pembayaran" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Klik untuk upload gambar</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WEBP (maks 5MB)</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                )}
              </div>
            )}

            {/* Cash Info */}
            {paymentMethod === 'cash' && (
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-sm text-green-700">
                  <strong>Catatan:</strong> Silakan bayar tunai di kasir toko kami dengan menunjukkan nomor pesanan: <strong>{orderNumber}</strong>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              onClick={handleUploadPayment}
              disabled={loading || (paymentMethod !== 'cash' && !paymentProof)}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Memproses...' : paymentMethod === 'cash' ? 'Konfirmasi Pesanan' : 'Kirim Bukti Pembayaran'}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Product Summary */}
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 rounded-md overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50 flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-pink-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                {product.category && (
                  <p className="text-xs text-gray-500">{product.category.name}</p>
                )}
                <p className="text-pink-600 font-semibold">{formatPrice(product.price)}</p>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <Label>Jumlah</Label>
              <div className="flex items-center gap-3 mt-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                  min={1}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Nomor Telepon *</Label>
              <Input
                id="phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Alamat {shippingMethod !== 'pickup' && '*'}</Label>
              <Textarea
                id="address"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder={shippingMethod === 'pickup' ? 'Alamat (opsional untuk ambil di toko)' : 'Alamat lengkap pengiriman'}
                className="mt-1"
                rows={2}
              />
            </div>

            {/* Shipping Method */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Metode Pengiriman</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {shippingMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = shippingMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setShippingMethod(method.id)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all",
                        isSelected 
                          ? "border-pink-500 bg-pink-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-5 w-5 flex-shrink-0", isSelected ? "text-pink-500" : "text-gray-400")} />
                        <div className="min-w-0">
                          <p className={cn("font-medium text-sm", isSelected && "text-pink-700")}>
                            {method.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{method.description}</p>
                          <p className={cn("text-xs font-semibold", method.cost === 0 ? "text-green-600" : "text-gray-700")}>
                            {method.cost === 0 ? 'Gratis' : formatPrice(method.cost)}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan untuk pesanan"
                className="mt-1"
              />
            </div>

            {/* Total */}
            <div className="space-y-2 p-4 bg-pink-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatPrice(product.price * quantity)}</span>
              </div>
              {shippingCost > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Ongkos Kirim ({selectedShipping.name})</span>
                  <span className="font-medium">{formatPrice(shippingCost)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-pink-200">
                <span className="font-semibold text-gray-700">Total Pembayaran</span>
                <span className="text-xl font-bold text-pink-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Memproses...' : 'Lanjut ke Pembayaran'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Badge component
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", className)}>
      {children}
    </span>
  )
}
