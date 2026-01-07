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
      bank_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          agency: string | null
          bank_code: string | null
          bank_name: string | null
          created_at: string | null
          current_balance: number | null
          id: string
          initial_balance: number | null
          is_active: boolean | null
          is_default: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          agency?: string | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          agency?: string | null
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string | null
          current_balance?: number | null
          id?: string
          initial_balance?: number | null
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bank_transactions: {
        Row: {
          amount: number
          balance_after: number
          bank_account_id: string
          created_at: string | null
          created_by: string
          description: string | null
          financial_transaction_id: string | null
          id: string
          reconciled: boolean | null
          reference_id: string | null
          reference_type: string | null
          type: string
        }
        Insert: {
          amount: number
          balance_after: number
          bank_account_id: string
          created_at?: string | null
          created_by: string
          description?: string | null
          financial_transaction_id?: string | null
          id?: string
          reconciled?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          bank_account_id?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          financial_transaction_id?: string | null
          id?: string
          reconciled?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_financial_transaction_id_fkey"
            columns: ["financial_transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
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
          current_shift_id: string | null
          difference: number | null
          expected_balance: number | null
          id: string
          number: number
          opened_at: string
          opening_balance: number
          operator_id: string
          register_type: string
          status: Database["public"]["Enums"]["register_status"]
          store_id: string | null
          terminal_id: string | null
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
          current_shift_id?: string | null
          difference?: number | null
          expected_balance?: number | null
          id?: string
          number: number
          opened_at?: string
          opening_balance?: number
          operator_id: string
          register_type?: string
          status?: Database["public"]["Enums"]["register_status"]
          store_id?: string | null
          terminal_id?: string | null
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
          current_shift_id?: string | null
          difference?: number | null
          expected_balance?: number | null
          id?: string
          number?: number
          opened_at?: string
          opening_balance?: number
          operator_id?: string
          register_type?: string
          status?: Database["public"]["Enums"]["register_status"]
          store_id?: string | null
          terminal_id?: string | null
          total_cash?: number
          total_credit?: number
          total_debit?: number
          total_fiado?: number
          total_pix?: number
          total_sales?: number
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_current_shift_id_fkey"
            columns: ["current_shift_id"]
            isOneToOne: false
            referencedRelation: "register_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_registers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_registers_terminal_id_fkey"
            columns: ["terminal_id"]
            isOneToOne: false
            referencedRelation: "register_terminals"
            referencedColumns: ["id"]
          },
        ]
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
      checks: {
        Row: {
          account: string | null
          agency: string | null
          amount: number
          bank_account_id: string | null
          bank_name: string | null
          check_number: string
          compensation_date: string | null
          created_at: string | null
          created_by: string
          customer_id: string | null
          due_date: string
          financial_transaction_id: string | null
          id: string
          issue_date: string | null
          notes: string | null
          sale_id: string | null
          status: string | null
          supplier_id: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          account?: string | null
          agency?: string | null
          amount: number
          bank_account_id?: string | null
          bank_name?: string | null
          check_number: string
          compensation_date?: string | null
          created_at?: string | null
          created_by: string
          customer_id?: string | null
          due_date: string
          financial_transaction_id?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          sale_id?: string | null
          status?: string | null
          supplier_id?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          account?: string | null
          agency?: string | null
          amount?: number
          bank_account_id?: string | null
          bank_name?: string | null
          check_number?: string
          compensation_date?: string | null
          created_at?: string | null
          created_by?: string
          customer_id?: string | null
          due_date?: string
          financial_transaction_id?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          sale_id?: string | null
          status?: string | null
          supplier_id?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checks_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checks_financial_transaction_id_fkey"
            columns: ["financial_transaction_id"]
            isOneToOne: false
            referencedRelation: "financial_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checks_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checks_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          commission_amount: number
          commission_percent: number
          created_at: string | null
          id: string
          notes: string | null
          paid_date: string | null
          product_id: string | null
          sale_id: string | null
          sale_total: number
          seller_id: string
          service_order_id: string | null
          status: string | null
        }
        Insert: {
          commission_amount: number
          commission_percent: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          product_id?: string | null
          sale_id?: string | null
          sale_total: number
          seller_id: string
          service_order_id?: string | null
          status?: string | null
        }
        Update: {
          commission_amount?: number
          commission_percent?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          product_id?: string | null
          sale_id?: string | null
          sale_total?: number
          seller_id?: string
          service_order_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
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
          birth_date: string | null
          block_reason: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          complement: string | null
          cpf: string | null
          created_at: string
          credit_limit: number
          current_debt: number
          email: string | null
          fantasy_name: string | null
          gender: string | null
          id: string
          ie: string | null
          image_url: string | null
          income: number | null
          is_active: boolean
          is_blocked: boolean | null
          name: string
          neighborhood: string | null
          notes: string | null
          number: string | null
          phone: string | null
          phone2: string | null
          profession: string | null
          rg: string | null
          state: string | null
          updated_at: string
          workplace: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          block_reason?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          credit_limit?: number
          current_debt?: number
          email?: string | null
          fantasy_name?: string | null
          gender?: string | null
          id?: string
          ie?: string | null
          image_url?: string | null
          income?: number | null
          is_active?: boolean
          is_blocked?: boolean | null
          name: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          phone2?: string | null
          profession?: string | null
          rg?: string | null
          state?: string | null
          updated_at?: string
          workplace?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          block_reason?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          credit_limit?: number
          current_debt?: number
          email?: string | null
          fantasy_name?: string | null
          gender?: string | null
          id?: string
          ie?: string | null
          image_url?: string | null
          income?: number | null
          is_active?: boolean
          is_blocked?: boolean | null
          name?: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          phone2?: string | null
          profession?: string | null
          rg?: string | null
          state?: string | null
          updated_at?: string
          workplace?: string | null
        }
        Relationships: []
      }
      financial_categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          type: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          type: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          barcode: string | null
          category_id: string | null
          created_at: string | null
          created_by: string
          customer_id: string | null
          description: string
          document_number: string | null
          due_date: string
          id: string
          installment_number: number | null
          notes: string | null
          number: number
          paid_amount: number | null
          paid_date: string | null
          payment_method: string | null
          purchase_order_id: string | null
          sale_id: string | null
          service_order_id: string | null
          status: string | null
          supplier_id: string | null
          total_installments: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          barcode?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by: string
          customer_id?: string | null
          description: string
          document_number?: string | null
          due_date: string
          id?: string
          installment_number?: number | null
          notes?: string | null
          number?: number
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          purchase_order_id?: string | null
          sale_id?: string | null
          service_order_id?: string | null
          status?: string | null
          supplier_id?: string | null
          total_installments?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          barcode?: string | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string
          customer_id?: string | null
          description?: string
          document_number?: string | null
          due_date?: string
          id?: string
          installment_number?: number | null
          notes?: string | null
          number?: number
          paid_amount?: number | null
          paid_date?: string | null
          payment_method?: string | null
          purchase_order_id?: string | null
          sale_id?: string | null
          service_order_id?: string | null
          status?: string | null
          supplier_id?: string | null
          total_installments?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "financial_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
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
      payment_methods: {
        Row: {
          code: string
          created_at: string | null
          days_to_receive: number | null
          fee_fixed: number | null
          fee_percent: number | null
          id: string
          installments_max: number | null
          is_active: boolean | null
          name: string
          requires_customer: boolean | null
          sort_order: number | null
          type: string
        }
        Insert: {
          code: string
          created_at?: string | null
          days_to_receive?: number | null
          fee_fixed?: number | null
          fee_percent?: number | null
          id?: string
          installments_max?: number | null
          is_active?: boolean | null
          name: string
          requires_customer?: boolean | null
          sort_order?: number | null
          type?: string
        }
        Update: {
          code?: string
          created_at?: string | null
          days_to_receive?: number | null
          fee_fixed?: number | null
          fee_percent?: number | null
          id?: string
          installments_max?: number | null
          is_active?: boolean | null
          name?: string
          requires_customer?: boolean | null
          sort_order?: number | null
          type?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          fee_amount: number | null
          id: string
          installments: number | null
          method: Database["public"]["Enums"]["payment_method"]
          net_amount: number | null
          notes: string | null
          paid_at: string | null
          payment_method_id: string | null
          sale_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          fee_amount?: number | null
          id?: string
          installments?: number | null
          method: Database["public"]["Enums"]["payment_method"]
          net_amount?: number | null
          notes?: string | null
          paid_at?: string | null
          payment_method_id?: string | null
          sale_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          fee_amount?: number | null
          id?: string
          installments?: number | null
          method?: Database["public"]["Enums"]["payment_method"]
          net_amount?: number | null
          notes?: string | null
          paid_at?: string | null
          payment_method_id?: string | null
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
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
      product_variations: {
        Row: {
          barcode: string | null
          color: string | null
          cost: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          material: string | null
          min_stock: number | null
          price: number | null
          product_id: string
          size: string | null
          sku: string | null
          stock: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          color?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material?: string | null
          min_stock?: number | null
          price?: number | null
          product_id: string
          size?: string | null
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          color?: string | null
          cost?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material?: string | null
          min_stock?: number | null
          price?: number | null
          product_id?: string
          size?: string | null
          sku?: string | null
          stock?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category_id: string | null
          cest: string | null
          cfop: string | null
          code: string
          commission_percent: number | null
          cost: number
          created_at: string
          expiry_date: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_weighted: boolean
          location: string | null
          manufacture_date: string | null
          min_stock: number
          min_wholesale_qty: number | null
          model: string | null
          name: string
          ncm: string | null
          notes: string | null
          origin: string | null
          price: number
          price_wholesale: number | null
          reference: string | null
          stock: number
          subcategory_id: string | null
          supplier_id: string | null
          unit: string
          updated_at: string
          warranty_days: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          cest?: string | null
          cfop?: string | null
          code: string
          commission_percent?: number | null
          cost?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_weighted?: boolean
          location?: string | null
          manufacture_date?: string | null
          min_stock?: number
          min_wholesale_qty?: number | null
          model?: string | null
          name: string
          ncm?: string | null
          notes?: string | null
          origin?: string | null
          price?: number
          price_wholesale?: number | null
          reference?: string | null
          stock?: number
          subcategory_id?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          warranty_days?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          cest?: string | null
          cfop?: string | null
          code?: string
          commission_percent?: number | null
          cost?: number
          created_at?: string
          expiry_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_weighted?: boolean
          location?: string | null
          manufacture_date?: string | null
          min_stock?: number
          min_wholesale_qty?: number | null
          model?: string | null
          name?: string
          ncm?: string | null
          notes?: string | null
          origin?: string | null
          price?: number
          price_wholesale?: number | null
          reference?: string | null
          stock?: number
          subcategory_id?: string | null
          supplier_id?: string | null
          unit?: string
          updated_at?: string
          warranty_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          code: string
          commission_percent: number | null
          created_at: string
          daily_goal: number | null
          email: string | null
          id: string
          image_url: string | null
          is_active: boolean
          monthly_goal: number | null
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          commission_percent?: number | null
          created_at?: string
          daily_goal?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          monthly_goal?: number | null
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          commission_percent?: number | null
          created_at?: string
          daily_goal?: number | null
          email?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          monthly_goal?: number | null
          name?: string
          phone?: string | null
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
      purchase_order_items: {
        Row: {
          batch_number: string | null
          created_at: string | null
          discount: number | null
          expiry_date: string | null
          id: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity: number | null
          subtotal: number
          unit_cost: number
          variation_id: string | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          discount?: number | null
          expiry_date?: string | null
          id?: string
          product_id: string
          purchase_order_id: string
          quantity: number
          received_quantity?: number | null
          subtotal: number
          unit_cost: number
          variation_id?: string | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          discount?: number | null
          expiry_date?: string | null
          id?: string
          product_id?: string
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number | null
          subtotal?: number
          unit_cost?: number
          variation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          discount: number | null
          expected_date: string | null
          id: string
          invoice_date: string | null
          invoice_key: string | null
          invoice_number: string | null
          notes: string | null
          number: number
          operator_id: string
          other_costs: number | null
          payment_condition: string | null
          payment_method: string | null
          received_date: string | null
          shipping: number | null
          status: string | null
          store_id: string | null
          subtotal: number | null
          supplier_id: string
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          expected_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_key?: string | null
          invoice_number?: string | null
          notes?: string | null
          number?: number
          operator_id: string
          other_costs?: number | null
          payment_condition?: string | null
          payment_method?: string | null
          received_date?: string | null
          shipping?: number | null
          status?: string | null
          store_id?: string | null
          subtotal?: number | null
          supplier_id: string
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          expected_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_key?: string | null
          invoice_number?: string | null
          notes?: string | null
          number?: number
          operator_id?: string
          other_costs?: number | null
          payment_condition?: string | null
          payment_method?: string | null
          received_date?: string | null
          shipping?: number | null
          status?: string | null
          store_id?: string | null
          subtotal?: number | null
          supplier_id?: string
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string | null
          discount: number | null
          discount_type: string | null
          id: string
          product_id: string
          quantity: number | null
          quote_id: string
          subtotal: number
          unit_price: number
          variation_id: string | null
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          discount_type?: string | null
          id?: string
          product_id: string
          quantity?: number | null
          quote_id: string
          subtotal: number
          unit_price: number
          variation_id?: string | null
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          discount_type?: string | null
          id?: string
          product_id?: string
          quantity?: number | null
          quote_id?: string
          subtotal?: number
          unit_price?: number
          variation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          converted_sale_id: string | null
          created_at: string | null
          customer_id: string | null
          discount: number | null
          discount_type: string | null
          id: string
          notes: string | null
          number: number
          seller_id: string
          status: string | null
          store_id: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          converted_sale_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          discount_type?: string | null
          id?: string
          notes?: string | null
          number?: number
          seller_id: string
          status?: string | null
          store_id?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          converted_sale_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          discount_type?: string | null
          id?: string
          notes?: string | null
          number?: number
          seller_id?: string
          status?: string | null
          store_id?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      register_shifts: {
        Row: {
          cash_total: number | null
          created_at: string | null
          credit_total: number | null
          debit_total: number | null
          deposits_total: number | null
          ended_at: string | null
          ending_cash: number | null
          fiado_total: number | null
          id: string
          notes: string | null
          operator_id: string
          pix_total: number | null
          register_id: string
          sales_count: number | null
          sales_total: number | null
          started_at: string
          starting_cash: number
          status: string
          withdrawals_total: number | null
        }
        Insert: {
          cash_total?: number | null
          created_at?: string | null
          credit_total?: number | null
          debit_total?: number | null
          deposits_total?: number | null
          ended_at?: string | null
          ending_cash?: number | null
          fiado_total?: number | null
          id?: string
          notes?: string | null
          operator_id: string
          pix_total?: number | null
          register_id: string
          sales_count?: number | null
          sales_total?: number | null
          started_at?: string
          starting_cash?: number
          status?: string
          withdrawals_total?: number | null
        }
        Update: {
          cash_total?: number | null
          created_at?: string | null
          credit_total?: number | null
          debit_total?: number | null
          deposits_total?: number | null
          ended_at?: string | null
          ending_cash?: number | null
          fiado_total?: number | null
          id?: string
          notes?: string | null
          operator_id?: string
          pix_total?: number | null
          register_id?: string
          sales_count?: number | null
          sales_total?: number | null
          started_at?: string
          starting_cash?: number
          status?: string
          withdrawals_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "register_shifts_register_id_fkey"
            columns: ["register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
        ]
      }
      register_terminals: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "register_terminals_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      return_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          return_id: string
          return_to_stock: boolean | null
          sale_item_id: string | null
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          return_id: string
          return_to_stock?: boolean | null
          sale_item_id?: string | null
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          return_id?: string
          return_to_stock?: boolean | null
          sale_item_id?: string | null
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "return_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_sale_item_id_fkey"
            columns: ["sale_item_id"]
            isOneToOne: false
            referencedRelation: "sale_items"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          notes: string | null
          number: number
          operator_id: string
          reason: string
          refund_method: string
          sale_id: string | null
          status: string | null
          store_credit_id: string | null
          supervisor_id: string | null
          total: number
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          number?: number
          operator_id: string
          reason: string
          refund_method: string
          sale_id?: string | null
          status?: string | null
          store_credit_id?: string | null
          supervisor_id?: string | null
          total: number
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          number?: number
          operator_id?: string
          reason?: string
          refund_method?: string
          sale_id?: string | null
          status?: string | null
          store_credit_id?: string | null
          supervisor_id?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "returns_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_store_credit_id_fkey"
            columns: ["store_credit_id"]
            isOneToOne: false
            referencedRelation: "store_credits"
            referencedColumns: ["id"]
          },
        ]
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
          commission_percent: number | null
          cost: number | null
          created_at: string
          discount: number
          discount_type: string
          id: string
          product_id: string
          quantity: number
          sale_id: string
          subtotal: number
          unit_price: number
          variation_id: string | null
          weight: number | null
        }
        Insert: {
          commission_percent?: number | null
          cost?: number | null
          created_at?: string
          discount?: number
          discount_type?: string
          id?: string
          product_id: string
          quantity?: number
          sale_id: string
          subtotal: number
          unit_price: number
          variation_id?: string | null
          weight?: number | null
        }
        Update: {
          commission_percent?: number | null
          cost?: number | null
          created_at?: string
          discount?: number
          discount_type?: string
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          subtotal?: number
          unit_price?: number
          variation_id?: string | null
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
          {
            foreignKeyName: "sale_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "product_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          commission_amount: number | null
          created_at: string
          customer_id: string | null
          delivery_address: string | null
          delivery_date: string | null
          discount: number
          discount_type: string
          id: string
          is_fiado: boolean
          notes: string | null
          number: number
          operator_id: string
          quote_id: string | null
          register_id: string
          seller_id: string | null
          shift_id: string | null
          status: Database["public"]["Enums"]["sale_status"]
          store_id: string | null
          subtotal: number
          total: number
        }
        Insert: {
          commission_amount?: number | null
          created_at?: string
          customer_id?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          discount?: number
          discount_type?: string
          id?: string
          is_fiado?: boolean
          notes?: string | null
          number?: number
          operator_id: string
          quote_id?: string | null
          register_id: string
          seller_id?: string | null
          shift_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          store_id?: string | null
          subtotal?: number
          total?: number
        }
        Update: {
          commission_amount?: number | null
          created_at?: string
          customer_id?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          discount?: number
          discount_type?: string
          id?: string
          is_fiado?: boolean
          notes?: string | null
          number?: number
          operator_id?: string
          quote_id?: string | null
          register_id?: string
          seller_id?: string | null
          shift_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          store_id?: string | null
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
            foreignKeyName: "sales_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_register_id_fkey"
            columns: ["register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "register_shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_history: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          id: string
          new_status: string | null
          old_status: string | null
          service_order_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          service_order_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          id?: string
          new_status?: string | null
          old_status?: string | null
          service_order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_order_history_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_items: {
        Row: {
          created_at: string | null
          description: string
          discount: number | null
          id: string
          product_id: string | null
          quantity: number | null
          service_order_id: string
          subtotal: number
          type: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          discount?: number | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          service_order_id: string
          subtotal: number
          type?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          discount?: number | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          service_order_id?: string
          subtotal?: number
          type?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_items_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_order_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          installments: number | null
          method: string
          notes: string | null
          operator_id: string
          payment_method_id: string | null
          service_order_id: string
          type: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          installments?: number | null
          method: string
          notes?: string | null
          operator_id: string
          payment_method_id?: string | null
          service_order_id: string
          type?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          installments?: number | null
          method?: string
          notes?: string | null
          operator_id?: string
          payment_method_id?: string | null
          service_order_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_order_payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_order_payments_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          checklist: Json | null
          completed_date: string | null
          created_at: string | null
          customer_id: string
          customer_notes: string | null
          defect_found: string | null
          defect_reported: string
          delivered_date: string | null
          discount: number | null
          equipment_accessories: string | null
          equipment_brand: string | null
          equipment_color: string | null
          equipment_condition: string | null
          equipment_model: string | null
          equipment_serial: string | null
          equipment_type: string
          estimated_date: string | null
          estimated_value: number | null
          final_value: number | null
          id: string
          images: string[] | null
          internal_notes: string | null
          labor_value: number | null
          number: number
          parts_value: number | null
          priority: string | null
          receptionist_id: string
          solution: string | null
          status: Database["public"]["Enums"]["service_order_status"] | null
          store_id: string | null
          technical_report: string | null
          technician_id: string | null
          updated_at: string | null
          warranty_until: string | null
        }
        Insert: {
          checklist?: Json | null
          completed_date?: string | null
          created_at?: string | null
          customer_id: string
          customer_notes?: string | null
          defect_found?: string | null
          defect_reported: string
          delivered_date?: string | null
          discount?: number | null
          equipment_accessories?: string | null
          equipment_brand?: string | null
          equipment_color?: string | null
          equipment_condition?: string | null
          equipment_model?: string | null
          equipment_serial?: string | null
          equipment_type: string
          estimated_date?: string | null
          estimated_value?: number | null
          final_value?: number | null
          id?: string
          images?: string[] | null
          internal_notes?: string | null
          labor_value?: number | null
          number?: number
          parts_value?: number | null
          priority?: string | null
          receptionist_id: string
          solution?: string | null
          status?: Database["public"]["Enums"]["service_order_status"] | null
          store_id?: string | null
          technical_report?: string | null
          technician_id?: string | null
          updated_at?: string | null
          warranty_until?: string | null
        }
        Update: {
          checklist?: Json | null
          completed_date?: string | null
          created_at?: string | null
          customer_id?: string
          customer_notes?: string | null
          defect_found?: string | null
          defect_reported?: string
          delivered_date?: string | null
          discount?: number | null
          equipment_accessories?: string | null
          equipment_brand?: string | null
          equipment_color?: string | null
          equipment_condition?: string | null
          equipment_model?: string | null
          equipment_serial?: string | null
          equipment_type?: string
          estimated_date?: string | null
          estimated_value?: number | null
          final_value?: number | null
          id?: string
          images?: string[] | null
          internal_notes?: string | null
          labor_value?: number | null
          number?: number
          parts_value?: number | null
          priority?: string | null
          receptionist_id?: string
          solution?: string | null
          status?: Database["public"]["Enums"]["service_order_status"] | null
          store_id?: string | null
          technical_report?: string | null
          technician_id?: string | null
          updated_at?: string | null
          warranty_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
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
      store_credits: {
        Row: {
          code: string
          created_at: string | null
          created_by: string
          current_amount: number
          customer_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          original_amount: number
          source: string
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by: string
          current_amount: number
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          original_amount: number
          source: string
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string
          current_amount?: number
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          original_amount?: number
          source?: string
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_credits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
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
          cep: string | null
          city: string | null
          cnpj: string | null
          complement: string | null
          created_at: string
          email: string | null
          fantasy_name: string | null
          id: string
          ie: string | null
          im: string | null
          logo_url: string | null
          name: string
          neighborhood: string | null
          number: string | null
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          fantasy_name?: string | null
          id?: string
          ie?: string | null
          im?: string | null
          logo_url?: string | null
          name?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          fantasy_name?: string | null
          id?: string
          ie?: string | null
          im?: string | null
          logo_url?: string | null
          name?: string
          neighborhood?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
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
      subcategories: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          cep: string | null
          city: string | null
          cnpj: string | null
          code: string
          complement: string | null
          contact_name: string | null
          contact_phone: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          fantasy_name: string | null
          id: string
          ie: string | null
          im: string | null
          is_active: boolean | null
          name: string
          neighborhood: string | null
          notes: string | null
          number: string | null
          phone: string | null
          phone2: string | null
          state: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          code: string
          complement?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          fantasy_name?: string | null
          id?: string
          ie?: string | null
          im?: string | null
          is_active?: boolean | null
          name: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          phone2?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          cep?: string | null
          city?: string | null
          cnpj?: string | null
          code?: string
          complement?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          fantasy_name?: string | null
          id?: string
          ie?: string | null
          im?: string | null
          is_active?: boolean | null
          name?: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          phone2?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
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
      service_order_status:
        | "received"
        | "waiting_approval"
        | "approved"
        | "in_progress"
        | "waiting_parts"
        | "completed"
        | "delivered"
        | "cancelled"
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
      service_order_status: [
        "received",
        "waiting_approval",
        "approved",
        "in_progress",
        "waiting_parts",
        "completed",
        "delivered",
        "cancelled",
      ],
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
