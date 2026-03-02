export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RoleType = 'admin' | 'cashier'
export type DiscountType = 'none' | 'amount' | 'percent'
export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'debit' | 'split'
export type PaymentStatus = 'paid' | 'pending'
export type StockMovementType = 'in' | 'out' | 'adjust' | 'transfer'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: RoleType
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: RoleType
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: RoleType
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          category_id: string | null
          price: number
          description: string | null
          image_url: string | null
          is_active: boolean
          barcode: string | null
          sku: string | null
          in_stock: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          category_id?: string | null
          price: number
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          barcode?: string | null
          sku?: string | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          category_id?: string | null
          price?: number
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          barcode?: string | null
          sku?: string | null
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      branches: {
        Row: {
          id: string
          name: string
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          created_at?: string
        }
      }
      warehouses: {
        Row: {
          id: string
          branch_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          branch_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          branch_id?: string
          name?: string
          created_at?: string
        }
      }
      product_stocks: {
        Row: {
          product_id: string
          warehouse_id: string
          stock: number
        }
        Insert: {
          product_id: string
          warehouse_id: string
          stock?: number
        }
        Update: {
          product_id?: string
          warehouse_id?: string
          stock?: number
        }
      }
      transactions: {
        Row: {
          id: string
          cashier_id: string
          branch_id: string
          warehouse_id: string
          subtotal_amount: number
          discount_type: DiscountType
          discount_value: number
          discount_amount: number
          final_amount: number
          payment_method: PaymentMethod
          payment_status: PaymentStatus
          cash_received: number
          change_amount: number
          notes: string | null
          transaction_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cashier_id: string
          branch_id: string
          warehouse_id: string
          subtotal_amount?: number
          discount_type?: DiscountType
          discount_value?: number
          discount_amount?: number
          final_amount?: number
          payment_method?: PaymentMethod
          payment_status?: PaymentStatus
          cash_received?: number
          change_amount?: number
          notes?: string | null
          transaction_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cashier_id?: string
          branch_id?: string
          warehouse_id?: string
          subtotal_amount?: number
          discount_type?: DiscountType
          discount_value?: number
          discount_amount?: number
          final_amount?: number
          payment_method?: PaymentMethod
          payment_status?: PaymentStatus
          cash_received?: number
          change_amount?: number
          notes?: string | null
          transaction_number?: string | null
          created_at?: string
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          product_id: string
          qty: number
          unit_price: number
          subtotal: number
          discount_type: DiscountType
          discount_value: number
          discount_amount: number
          final_subtotal: number
        }
        Insert: {
          id?: string
          transaction_id: string
          product_id: string
          qty: number
          unit_price: number
          subtotal: number
          discount_type?: DiscountType
          discount_value?: number
          discount_amount?: number
          final_subtotal: number
        }
        Update: {
          id?: string
          transaction_id?: string
          product_id?: string
          qty?: number
          unit_price?: number
          subtotal?: number
          discount_type?: DiscountType
          discount_value?: number
          discount_amount?: number
          final_subtotal?: number
        }
      }
      transaction_payments: {
        Row: {
          id: string
          transaction_id: string
          method: PaymentMethod
          amount: number
          reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          transaction_id: string
          method: PaymentMethod
          amount: number
          reference?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          transaction_id?: string
          method?: PaymentMethod
          amount?: number
          reference?: string | null
          created_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          from_warehouse_id: string | null
          to_warehouse_id: string | null
          type: StockMovementType
          qty: number
          ref_transaction_id: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          type: StockMovementType
          qty: number
          ref_transaction_id?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          type?: StockMovementType
          qty?: number
          ref_transaction_id?: string | null
          note?: string | null
          created_at?: string
        }
      }
      idempotency_keys: {
        Row: {
          key: string
          cashier_id: string
          created_at: string
          transaction_id: string | null
        }
        Insert: {
          key: string
          cashier_id: string
          created_at?: string
          transaction_id?: string | null
        }
        Update: {
          key?: string
          cashier_id?: string
          created_at?: string
          transaction_id?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_transaction: {
        Args: {
          p_idem_key: string
          p_cashier_id: string
          p_branch_id: string
          p_warehouse_id: string
          p_items: Json
          p_tx_discount_type: DiscountType
          p_tx_discount_value: number
          p_payment: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
