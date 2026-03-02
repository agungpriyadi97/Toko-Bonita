// Re-export database types
export * from './database.types'

// Additional application types
export interface User {
  id: string
  email: string
  fullName: string | null
  role: 'admin' | 'cashier'
  branchId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  barcode: string | null
  sku: string | null
  description: string | null
  price: number
  costPrice: number | null
  categoryId: string | null
  imageUrl: string | null
  unit: string
  minStock: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category?: Category | null
  stocks?: ProductStock[]
}

export interface Branch {
  id: string
  name: string
  address: string | null
  phone: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Warehouse {
  id: string
  name: string
  branchId: string | null
  address: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  branch?: Branch | null
}

export interface ProductStock {
  id: string
  productId: string
  warehouseId: string
  quantity: number
  createdAt: Date
  updatedAt: Date
  product?: Product
  warehouse?: Warehouse
}

export interface Transaction {
  id: string
  invoiceNumber: string
  cashierId: string
  branchId: string
  warehouseId: string
  subtotal: number
  discountType: 'percent' | 'amount' | 'none'
  discountValue: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  finalAmount: number
  status: 'completed' | 'pending' | 'cancelled'
  notes: string | null
  createdAt: Date
  cashier?: User
  branch?: Branch
  warehouse?: Warehouse
  items?: TransactionItem[]
  payments?: TransactionPayment[]
}

export interface TransactionItem {
  id: string
  transactionId: string
  productId: string
  productName: string
  productBarcode: string | null
  productSku: string | null
  quantity: number
  unitPrice: number
  discountType: 'percent' | 'amount' | 'none'
  discountValue: number
  discountAmount: number
  totalPrice: number
  createdAt: Date
  product?: Product
}

export interface TransactionPayment {
  id: string
  transactionId: string
  paymentMethod: 'cash' | 'qris' | 'transfer' | 'debit'
  amount: number
  status: 'paid' | 'pending'
  referenceNumber: string | null
  createdAt: Date
}

export interface StockMovement {
  id: string
  productId: string
  warehouseId: string
  type: 'in' | 'out' | 'transfer_in' | 'transfer_out' | 'adjustment'
  quantity: number
  referenceType: 'transaction' | 'transfer' | 'adjustment' | null
  referenceId: string | null
  notes: string | null
  createdBy: string
  createdAt: Date
  product?: Product
  warehouse?: Warehouse
}

export interface IdempotencyKey {
  id: string
  key: string
  response: Record<string, unknown> | null
  createdAt: Date
  expiresAt: Date
}

// Cart types for POS
export interface CartItem {
  product: Product
  quantity: number
  discountType: 'percent' | 'amount' | 'none'
  discountValue: number
}

export interface PaymentInput {
  method: 'cash' | 'qris' | 'transfer' | 'debit'
  amount: number
  status: 'paid' | 'pending'
  referenceNumber?: string | null
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
