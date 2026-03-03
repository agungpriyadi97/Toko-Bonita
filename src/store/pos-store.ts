import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, Branch, Warehouse } from '@/types'

export interface CartItem {
  product: Product
  quantity: number
  discountType: 'percent' | 'amount' | 'none'
  discountValue: number
}

export interface PaymentMethod {
  id: string
  method: 'cash' | 'qris' | 'transfer' | 'debit'
  amount: number
  status: 'paid' | 'pending'
  referenceNumber: string | null
}

interface PosState {
  // Active branch and warehouse
  activeBranch: Branch | null
  activeWarehouse: Warehouse | null
  setActiveBranch: (branch: Branch | null) => void
  setActiveWarehouse: (warehouse: Warehouse | null) => void
  
  // Cart
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateItemDiscount: (productId: string, discountType: 'percent' | 'amount' | 'none', discountValue: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  
  // Transaction discount
  transactionDiscountType: 'percent' | 'amount' | 'none'
  transactionDiscountValue: number
  setTransactionDiscount: (type: 'percent' | 'amount' | 'none', value: number) => void
  
  // Payments
  payments: PaymentMethod[]
  addPayment: (payment: Omit<PaymentMethod, 'id'>) => void
  updatePayment: (id: string, payment: Partial<PaymentMethod>) => void
  removePayment: (id: string) => void
  clearPayments: () => void
  
  // Calculations
  getSubtotal: () => number
  getItemDiscountTotal: () => number
  getTransactionDiscountAmount: () => number
  getTotalAmount: () => number
  getFinalAmount: () => number
  getTotalPayment: () => number
  getRemainingPayment: () => number
  
  // Transaction state
  isProcessing: boolean
  setIsProcessing: (value: boolean) => void
  lastIdempotencyKey: string
  generateNewIdempotencyKey: () => void
}

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      // Active branch and warehouse
      activeBranch: null,
      activeWarehouse: null,
      setActiveBranch: (branch) => set({ activeBranch: branch }),
      setActiveWarehouse: (warehouse) => set({ activeWarehouse: warehouse }),
      
      // Cart
      cart: [],
      
      addToCart: (product, quantity = 1) => {
        const { cart } = get()
        const existingItem = cart.find(item => item.product.id === product.id)
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          })
        } else {
          set({
            cart: [...cart, {
              product,
              quantity,
              discountType: 'none',
              discountValue: 0
            }]
          })
        }
      },
      
      updateQuantity: (productId, quantity) => {
        const { cart } = get()
        if (quantity <= 0) {
          set({ cart: cart.filter(item => item.product.id !== productId) })
        } else {
          set({
            cart: cart.map(item =>
              item.product.id === productId
                ? { ...item, quantity }
                : item
            )
          })
        }
      },
      
      updateItemDiscount: (productId, discountType, discountValue) => {
        const { cart } = get()
        set({
          cart: cart.map(item =>
            item.product.id === productId
              ? { ...item, discountType, discountValue }
              : item
          )
        })
      },
      
      removeFromCart: (productId) => {
        const { cart } = get()
        set({ cart: cart.filter(item => item.product.id !== productId) })
      },
      
      clearCart: () => set({ cart: [], transactionDiscountType: 'none', transactionDiscountValue: 0, payments: [] }),
      
      // Transaction discount
      transactionDiscountType: 'none',
      transactionDiscountValue: 0,
      setTransactionDiscount: (type, value) => set({ transactionDiscountType: type, transactionDiscountValue: value }),
      
      // Payments
      payments: [],
      
      addPayment: (payment) => {
        const { payments } = get()
        const newPayment = {
          ...payment,
          id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
        set({ payments: [...payments, newPayment] })
      },
      
      updatePayment: (id, payment) => {
        const { payments } = get()
        set({
          payments: payments.map(p => p.id === id ? { ...p, ...payment } : p)
        })
      },
      
      removePayment: (id) => {
        const { payments } = get()
        set({ payments: payments.filter(p => p.id !== id) })
      },
      
      clearPayments: () => set({ payments: [] }),
      
      // Calculations
      getSubtotal: () => {
        const { cart } = get()
        return cart.reduce((total, item) => {
          const itemTotal = item.product.price * item.quantity
          let itemDiscount = 0
          if (item.discountType === 'percent') {
            itemDiscount = (itemTotal * item.discountValue) / 100
          } else if (item.discountType === 'amount') {
            itemDiscount = item.discountValue * item.quantity
          }
          return total + (itemTotal - itemDiscount)
        }, 0)
      },
      
      getItemDiscountTotal: () => {
        const { cart } = get()
        return cart.reduce((total, item) => {
          const itemTotal = item.product.price * item.quantity
          if (item.discountType === 'percent') {
            return total + (itemTotal * item.discountValue) / 100
          } else if (item.discountType === 'amount') {
            return total + (item.discountValue * item.quantity)
          }
          return total
        }, 0)
      },
      
      getTransactionDiscountAmount: () => {
        const { transactionDiscountType, transactionDiscountValue } = get()
        const subtotal = get().getSubtotal()
        
        if (transactionDiscountType === 'percent') {
          return (subtotal * transactionDiscountValue) / 100
        } else if (transactionDiscountType === 'amount') {
          return transactionDiscountValue
        }
        return 0
      },
      
      getTotalAmount: () => {
        const subtotal = get().getSubtotal()
        const transactionDiscount = get().getTransactionDiscountAmount()
        return subtotal - transactionDiscount
      },
      
      getFinalAmount: () => {
        return get().getTotalAmount()
      },
      
      getTotalPayment: () => {
        const { payments } = get()
        return payments.reduce((total, payment) => total + payment.amount, 0)
      },
      
      getRemainingPayment: () => {
        const finalAmount = get().getFinalAmount()
        const totalPayment = get().getTotalPayment()
        return finalAmount - totalPayment
      },
      
      // Transaction state
      isProcessing: false,
      setIsProcessing: (value) => set({ isProcessing: value }),
      lastIdempotencyKey: '',
      generateNewIdempotencyKey: () => set({ lastIdempotencyKey: `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })
    }),
    {
      name: 'pos-storage',
      partialize: (state) => ({
        activeBranch: state.activeBranch,
        activeWarehouse: state.activeWarehouse
      })
    }
  )
)
