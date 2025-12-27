export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          reason: string | null
          store_id: string | null
          supervisor_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          store_id?: string | null
          supervisor_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          reason?: string | null
          store_id?: string | null
          supervisor_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_movements: {
        Row: {
          amount: number
          created_at: string
          id: string
          operator_id: string
          reason: string
          register_id: string
          supervisor_id: string | null
          type: Database["public"]["Enums"]["movement_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          operator_id: string
          reason: string
          register_id: string
          supervisor_id?: string | null
          type: Database["public"]["Enums"]["movement_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          operator_id?: string
          reason?: string
          register_id?: string
          supervisor_id?: string | null
          type?: Database["public"]["Enums"]["movement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_register_id_fkey"
            columns: ["register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_registers: {
        Row: {
          closed_at: string | null
          closing_balance: number | null
          created_at: string
          difference: number | null
          expected_balance: number | null
          id: string
          number: number
          opened_at: string
          opening_balance: number
          operator_id: string
          status: Database["public"]["Enums"]["register_status"]
          total_cash: number
          total_credit: number
          total_debit: number
          total_fiado: number
          total_pix: number
          total_sales: number
        }
        Insert: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          difference?: number | null
          expected_balance?: number | null
          id?: string
          number: number
          opened_at?: string
          opening_balance?: number
          operator_id: string
          status?: Database["public"]["Enums"]["register_status"]
          total_cash?: number
          total_credit?: number
          total_debit?: number
          total_fiado?: number
          total_pix?: number
          total_sales?: number
        }
        Update: {
          closed_at?: string | null
          closing_balance?: number | null
          created_at?: string
          difference?: number | null
          expected_balance?: number | null
          id?: string
          number?: number
          opened_at?: string
          opening_balance?: number
          operator_id?: string
          status?: Database["public"]["Enums"]["register_status"]
          total_cash?: number
          total_credit?: number
          total_debit?: number
          total_fiado?: number
          total_pix?: number
          total_sales?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      customer_points: {
        Row: {
          available_points: number
          created_at: string | null
          customer_id: string
          id: string
          program_id: string
          redeemed_points: number
          total_points: number
          updated_at: string | null
        }
        Insert: {
          available_points?: number
          created_at?: string | null
          customer_id: string
          id?: string
          program_id: string
          redeemed_points?: number
          total_points?: number
          updated_at?: string | null
        }
        Update: {
          available_points?: number
          created_at?: string | null
          customer_id?: string
          id?: string
          program_id?: string
          redeemed_points?: number
          total_points?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_points_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_points_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "loyalty_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          cpf: string | null
          created_at: string
          credit_limit: number
          current_debt: number
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          credit_limit?: number
          current_debt?: number
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cpf?: string | null
          created_at?: string
          credit_limit?: number
          current_debt?: number
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_programs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          min_points_redeem: number
          name: string
          points_per_real: number
          points_value: number
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          min_points_redeem?: number
          name: string
          points_per_real?: number
          points_value?: number
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          min_points_redeem?: number
          name?: string
          points_per_real?: number
          points_value?: number
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_programs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          sale_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          sale_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          created_at: string | null
          customer_id: string
          description: string | null
          id: string
          operator_id: string | null
          points: number
          program_id: string
          sale_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          description?: string | null
          id?: string
          operator_id?: string | null
          points: number
          program_id: string
          sale_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          operator_id?: string | null
          points?: number
          program_id?: string
          sale_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "loyalty_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          code: string
          cost: number
          created_at: string
          id: string
          is_active: boolean
          is_weighted: boolean
          min_stock: number
          name: string
          price: number
          stock: number
          unit: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          code: string
          cost?: number
          created_at?: string
          id?: string
          is_active?: boolean
          is_weighted?: boolean
          min_stock?: number
          name: string
          price?: number
          stock?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          code?: string
          cost?: number
          created_at?: string
          id?: string
          is_active?: boolean
          is_weighted?: boolean
          min_stock?: number
          name?: string
          price?: number
          stock?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotion_products: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          product_id: string | null
          promotion_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          promotion_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          promotion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_stores: {
        Row: {
          created_at: string | null
          id: string
          promotion_id: string
          store_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          promotion_id: string
          store_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          promotion_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_stores_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_stores_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          applies_to: string | null
          buy_quantity: number | null
          code: string | null
          created_at: string | null
          created_by: string | null
          days_of_week: number[] | null
          description: string | null
          end_date: string
          end_time: string | null
          get_quantity: number | null
          id: string
          is_active: boolean | null
          is_cumulative: boolean | null
          max_discount: number | null
          min_quantity: number | null
          min_value: number | null
          name: string
          priority: number | null
          start_date: string
          start_time: string | null
          type: Database["public"]["Enums"]["promotion_type"]
          updated_at: string | null
          value: number | null
        }
        Insert: {
          applies_to?: string | null
          buy_quantity?: number | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          days_of_week?: number[] | null
          description?: string | null
          end_date: string
          end_time?: string | null
          get_quantity?: number | null
          id?: string
          is_active?: boolean | null
          is_cumulative?: boolean | null
          max_discount?: number | null
          min_quantity?: number | null
          min_value?: number | null
          name: string
          priority?: number | null
          start_date: string
          start_time?: string | null
          type: Database["public"]["Enums"]["promotion_type"]
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          applies_to?: string | null
          buy_quantity?: number | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          days_of_week?: number[] | null
          description?: string | null
          end_date?: string
          end_time?: string | null
          get_quantity?: number | null
          id?: string
          is_active?: boolean | null
          is_cumulative?: boolean | null
          max_discount?: number | null
          min_quantity?: number | null
          min_value?: number | null
          name?: string
          priority?: number | null
          start_date?: string
          start_time?: string | null
          type?: Database["public"]["Enums"]["promotion_type"]
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          created_at: string
          discount: number
          discount_type: string
          id: string
          product_id: string
          quantity: number
          sale_id: string
          subtotal: number
          unit_price: number
          weight: number | null
        }
        Insert: {
          created_at?: string
          discount?: number
          discount_type?: string
          id?: string
          product_id: string
          quantity?: number
          sale_id: string
          subtotal: number
          unit_price: number
          weight?: number | null
        }
        Update: {
          created_at?: string
          discount?: number
          discount_type?: string
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          subtotal?: number
          unit_price?: number
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          discount: number
          discount_type: string
          id: string
          is_fiado: boolean
          number: number
          operator_id: string
          register_id: string
          status: Database["public"]["Enums"]["sale_status"]
          subtotal: number
          total: number
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          discount_type?: string
          id?: string
          is_fiado?: boolean
          number?: number
          operator_id: string
          register_id: string
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          total?: number
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          discount?: number
          discount_type?: string
          id?: string
          is_fiado?: boolean
          number?: number
          operator_id?: string
          register_id?: string
          status?: Database["public"]["Enums"]["sale_status"]
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_register_id_fkey"
            columns: ["register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          batch_number: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          new_stock: number
          notes: string | null
          operator_id: string
          previous_stock: number
          product_id: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          store_id: string
          supervisor_id: string | null
          total_cost: number | null
          type: Database["public"]["Enums"]["stock_movement_type"]
          unit_cost: number | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          new_stock?: number
          notes?: string | null
          operator_id: string
          previous_stock?: number
          product_id: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          store_id: string
          supervisor_id?: string | null
          total_cost?: number | null
          type: Database["public"]["Enums"]["stock_movement_type"]
          unit_cost?: number | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          new_stock?: number
          notes?: string | null
          operator_id?: string
          previous_stock?: number
          product_id?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          store_id?: string
          supervisor_id?: string | null
          total_cost?: number | null
          type?: Database["public"]["Enums"]["stock_movement_type"]
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          received_quantity: number | null
          requested_quantity: number
          shipped_quantity: number | null
          transfer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          received_quantity?: number | null
          requested_quantity: number
          shipped_quantity?: number | null
          transfer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          received_quantity?: number | null
          requested_quantity?: number
          shipped_quantity?: number | null
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          from_store_id: string
          id: string
          notes: string | null
          number: number
          received_at: string | null
          received_by: string | null
          requested_at: string | null
          shipped_at: string | null
          shipped_by: string | null
          status: Database["public"]["Enums"]["transfer_status"] | null
          to_store_id: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          from_store_id: string
          id?: string
          notes?: string | null
          number?: number
          received_at?: string | null
          received_by?: string | null
          requested_at?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          to_store_id: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          from_store_id?: string
          id?: string
          notes?: string | null
          number?: number
          received_at?: string | null
          received_by?: string | null
          requested_at?: string | null
          shipped_at?: string | null
          shipped_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          to_store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_store_id_fkey"
            columns: ["from_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_store_id_fkey"
            columns: ["to_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          cost: number
          created_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          max_stock: number | null
          min_stock: number
          price: number
          product_id: string
          stock: number
          store_id: string
          updated_at: string | null
        }
        Insert: {
          cost?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_stock?: number | null
          min_stock?: number
          price?: number
          product_id: string
          stock?: number
          store_id: string
          updated_at?: string | null
        }
        Update: {
          cost?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          max_stock?: number | null
          min_stock?: number
          price?: number
          product_id?: string
          stock?: number
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address: string | null
          cnpj: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_users: {
        Row: {
          can_transfer: boolean | null
          created_at: string | null
          id: string
          is_primary: boolean | null
          store_id: string
          user_id: string
        }
        Insert: {
          can_transfer?: boolean | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          store_id: string
          user_id: string
        }
        Update: {
          can_transfer?: boolean | null
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_users_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          code: string
          created_at: string | null
          email: string | null
          id: string
          ie: string | null
          is_active: boolean | null
          is_matrix: boolean | null
          name: string
          parent_store_id: string | null
          phone: string | null
          state: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          code: string
          created_at?: string | null
          email?: string | null
          id?: string
          ie?: string | null
          is_active?: boolean | null
          is_matrix?: boolean | null
          name: string
          parent_store_id?: string | null
          phone?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          code?: string
          created_at?: string | null
          email?: string | null
          id?: string
          ie?: string | null
          is_active?: boolean | null
          is_matrix?: boolean | null
          name?: string
          parent_store_id?: string | null
          phone?: string | null
          state?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_parent_store_id_fkey"
            columns: ["parent_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_store: { Args: { _user_id: string }; Returns: string }
      has_permission: {
        Args: { _permission_code: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "operator" | "supervisor" | "admin"
      movement_type: "withdrawal" | "deposit"
      payment_method: "cash" | "pix" | "credit" | "debit" | "fiado"
      promotion_type:
        | "percentage"
        | "fixed"
        | "buy_x_get_y"
        | "combo"
        | "progressive"
        | "happy_hour"
      register_status: "open" | "closed"
      sale_status: "pending" | "completed" | "cancelled"
      stock_movement_type:
        | "entrada"
        | "saida"
        | "ajuste"
        | "transferencia_entrada"
        | "transferencia_saida"
        | "perda"
        | "venda"
        | "devolucao"
        | "inventario"
      transfer_status:
        | "pending"
        | "approved"
        | "in_transit"
        | "received"
        | "partial"
        | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["operator", "supervisor", "admin"],
      movement_type: ["withdrawal", "deposit"],
      payment_method: ["cash", "pix", "credit", "debit", "fiado"],
      promotion_type: [
        "percentage",
        "fixed",
        "buy_x_get_y",
        "combo",
        "progressive",
        "happy_hour",
      ],
      register_status: ["open", "closed"],
      sale_status: ["pending", "completed", "cancelled"],
      stock_movement_type: [
        "entrada",
        "saida",
        "ajuste",
        "transferencia_entrada",
        "transferencia_saida",
        "perda",
        "venda",
        "devolucao",
        "inventario",
      ],
      transfer_status: [
        "pending",
        "approved",
        "in_transit",
        "received",
        "partial",
        "cancelled",
      ],
    },
  },
} as const
