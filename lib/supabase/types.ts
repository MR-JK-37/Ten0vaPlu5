export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor: string | null
          after: Json | null
          at: string
          before: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_run_items: {
        Row: {
          billing_run_id: string
          created_at: string
          detail: string | null
          id: string
          invoice_id: string | null
          outcome: string
          subscription_id: string | null
        }
        Insert: {
          billing_run_id: string
          created_at?: string
          detail?: string | null
          id?: string
          invoice_id?: string | null
          outcome: string
          subscription_id?: string | null
        }
        Update: {
          billing_run_id?: string
          created_at?: string
          detail?: string | null
          id?: string
          invoice_id?: string | null
          outcome?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_run_items_billing_run_id_fkey"
            columns: ["billing_run_id"]
            isOneToOne: false
            referencedRelation: "billing_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_run_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_run_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_runs: {
        Row: {
          as_of: string
          created_count: number
          dry_run: boolean
          due_count: number
          error_count: number
          finished_at: string | null
          id: string
          skipped_count: number
          started_at: string
          started_by: string | null
          status: string
        }
        Insert: {
          as_of: string
          created_count?: number
          dry_run?: boolean
          due_count?: number
          error_count?: number
          finished_at?: string | null
          id?: string
          skipped_count?: number
          started_at?: string
          started_by?: string | null
          status?: string
        }
        Update: {
          as_of?: string
          created_count?: number
          dry_run?: boolean
          due_count?: number
          error_count?: number
          finished_at?: string | null
          id?: string
          skipped_count?: number
          started_at?: string
          started_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_runs_started_by_fkey"
            columns: ["started_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          billing_address: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          profile_id: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discounts: {
        Row: {
          applies_to: Database["public"]["Enums"]["discount_applies_to"]
          created_at: string
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["discount_kind"]
          min_purchase: number | null
          min_quantity: number | null
          name: string
          product_ids: string[]
          subscription_ids: string[]
          times_used: number
          updated_at: string
          usage_limit: number | null
          valid_from: string
          valid_to: string | null
          value: number
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["discount_applies_to"]
          created_at?: string
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["discount_kind"]
          min_purchase?: number | null
          min_quantity?: number | null
          name: string
          product_ids?: string[]
          subscription_ids?: string[]
          times_used?: number
          updated_at?: string
          usage_limit?: number | null
          valid_from?: string
          valid_to?: string | null
          value: number
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["discount_applies_to"]
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["discount_kind"]
          min_purchase?: number | null
          min_quantity?: number | null
          name?: string
          product_ids?: string[]
          subscription_ids?: string[]
          times_used?: number
          updated_at?: string
          usage_limit?: number | null
          valid_from?: string
          valid_to?: string | null
          value?: number
        }
        Relationships: []
      }
      invoice_lines: {
        Row: {
          amount: number
          description: string
          discount_amount: number
          id: string
          invoice_id: string
          product_id: string | null
          quantity: number
          tax_amount: number
          unit_price: number
        }
        Insert: {
          amount: number
          description: string
          discount_amount?: number
          id?: string
          invoice_id: string
          product_id?: string | null
          quantity: number
          tax_amount?: number
          unit_price: number
        }
        Update: {
          amount?: number
          description?: string
          discount_amount?: number
          id?: string
          invoice_id?: string
          product_id?: string | null
          quantity?: number
          tax_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number
          applied_discount_id: string | null
          created_at: string
          customer_id: string
          discount_total: number
          due_date: string
          id: string
          issue_date: string
          number: string
          period_end: string
          period_start: string
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subscription_id: string
          subtotal: number
          tax_total: number
          total: number
          updated_at: string
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number
          applied_discount_id?: string | null
          created_at?: string
          customer_id: string
          discount_total?: number
          due_date: string
          id?: string
          issue_date?: string
          number: string
          period_end: string
          period_start: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subscription_id: string
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number
          applied_discount_id?: string | null
          created_at?: string
          customer_id?: string
          discount_total?: number
          due_date?: string
          id?: string
          issue_date?: string
          number?: string
          period_end?: string
          period_start?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subscription_id?: string
          subtotal?: number
          tax_total?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_applied_discount_id_fkey"
            columns: ["applied_discount_id"]
            isOneToOne: false
            referencedRelation: "discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_attempts: {
        Row: {
          amount: number
          attempt_number: number
          checkout_url: string | null
          created_at: string
          id: string
          invoice_id: string
          order_id: string
          provider: string
          provider_payment_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          attempt_number?: number
          checkout_url?: string | null
          created_at?: string
          id?: string
          invoice_id: string
          order_id: string
          provider: string
          provider_payment_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          attempt_number?: number
          checkout_url?: string | null
          created_at?: string
          id?: string
          invoice_id?: string
          order_id?: string
          provider?: string
          provider_payment_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          note: string | null
          paid_on: string
          provider: string | null
          provider_payment_id: string | null
          recorded_by: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verification_level: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          paid_on?: string
          provider?: string | null
          provider_payment_id?: string | null
          recorded_by?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verification_level?: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          note?: string | null
          paid_on?: string
          provider?: string | null
          provider_payment_id?: string | null
          recorded_by?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verification_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          allow_early_close: boolean
          allow_pause: boolean
          allow_renew: boolean
          auto_close_on_end: boolean
          available_from: string
          available_to: string | null
          billing_period: Database["public"]["Enums"]["billing_period"]
          created_at: string
          id: string
          is_active: boolean
          min_quantity: number
          name: string
          price: number
          product_id: string | null
          updated_at: string
        }
        Insert: {
          allow_early_close?: boolean
          allow_pause?: boolean
          allow_renew?: boolean
          auto_close_on_end?: boolean
          available_from?: string
          available_to?: string | null
          billing_period: Database["public"]["Enums"]["billing_period"]
          created_at?: string
          id?: string
          is_active?: boolean
          min_quantity?: number
          name: string
          price: number
          product_id?: string | null
          updated_at?: string
        }
        Update: {
          allow_early_close?: boolean
          allow_pause?: boolean
          allow_renew?: boolean
          auto_close_on_end?: boolean
          available_from?: string
          available_to?: string | null
          billing_period?: Database["public"]["Enums"]["billing_period"]
          created_at?: string
          id?: string
          is_active?: boolean
          min_quantity?: number
          name?: string
          price?: number
          product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_attributes: {
        Row: {
          created_at: string
          id: string
          name: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_attributes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variant_values: {
        Row: {
          attribute_id: string
          created_at: string
          extra_price: number
          id: string
          value: string
        }
        Insert: {
          attribute_id: string
          created_at?: string
          extra_price?: number
          id?: string
          value: string
        }
        Update: {
          attribute_id?: string
          created_at?: string
          extra_price?: number
          id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_values_attribute_id_fkey"
            columns: ["attribute_id"]
            isOneToOne: false
            referencedRelation: "product_attributes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          cost_price: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          sales_price: number
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
        }
        Insert: {
          cost_price?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          sales_price: number
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Update: {
          cost_price?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          sales_price?: number
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      quotation_template_lines: {
        Row: {
          id: string
          product_id: string
          quantity: number
          template_id: string
          variant_value_ids: string[]
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number
          template_id: string
          variant_value_ids?: string[]
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          template_id?: string
          variant_value_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "quotation_template_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_template_lines_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "quotation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          plan_id: string
          updated_at: string
          validity_days: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          plan_id: string
          updated_at?: string
          validity_days?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          plan_id?: string
          updated_at?: string
          validity_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_templates_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          last_value: number
          prefix: string
          year: number
        }
        Insert: {
          last_value?: number
          prefix: string
          year: number
        }
        Update: {
          last_value?: number
          prefix?: string
          year?: number
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          actor: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["subscription_status"] | null
          id: string
          reason: string | null
          subscription_id: string
          to_status: Database["public"]["Enums"]["subscription_status"]
        }
        Insert: {
          actor?: string | null
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          id?: string
          reason?: string | null
          subscription_id: string
          to_status: Database["public"]["Enums"]["subscription_status"]
        }
        Update: {
          actor?: string | null
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          id?: string
          reason?: string | null
          subscription_id?: string
          to_status?: Database["public"]["Enums"]["subscription_status"]
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_lines: {
        Row: {
          amount: number
          id: string
          product_id: string
          quantity: number
          subscription_id: string
          tax_ids: string[]
          unit_price: number
          variant_value_ids: string[]
        }
        Insert: {
          amount: number
          id?: string
          product_id: string
          quantity?: number
          subscription_id: string
          tax_ids?: string[]
          unit_price: number
          variant_value_ids?: string[]
        }
        Update: {
          amount?: number
          id?: string
          product_id?: string
          quantity?: number
          subscription_id?: string
          tax_ids?: string[]
          unit_price?: number
          variant_value_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "subscription_lines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_lines_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          closed_reason: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          expiry_date: string | null
          id: string
          next_billing_date: string | null
          number: string
          payment_terms: number
          plan_id: string
          quote_valid_until: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          template_id: string | null
          updated_at: string
        }
        Insert: {
          closed_reason?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          expiry_date?: string | null
          id?: string
          next_billing_date?: string | null
          number: string
          payment_terms?: number
          plan_id: string
          quote_valid_until?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          closed_reason?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          expiry_date?: string | null
          id?: string
          next_billing_date?: string | null
          number?: string
          payment_terms?: number
          plan_id?: string
          quote_valid_until?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "quotation_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      taxes: {
        Row: {
          applies_to: Database["public"]["Enums"]["applies_to"]
          created_at: string
          id: string
          is_active: boolean
          name: string
          product_ids: string[]
          rate: number
          type: Database["public"]["Enums"]["tax_type"]
          updated_at: string
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          applies_to?: Database["public"]["Enums"]["applies_to"]
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          product_ids?: string[]
          rate: number
          type: Database["public"]["Enums"]["tax_type"]
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          applies_to?: Database["public"]["Enums"]["applies_to"]
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          product_ids?: string[]
          rate?: number
          type?: Database["public"]["Enums"]["tax_type"]
          updated_at?: string
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          delivery_id: string
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          signature_ok: boolean
        }
        Insert: {
          created_at?: string
          delivery_id: string
          id?: string
          payload: Json
          processed_at?: string | null
          provider: string
          signature_ok: boolean
        }
        Update: {
          created_at?: string
          delivery_id?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          signature_ok?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_period: {
        Args: {
          p_date: string
          p_period: Database["public"]["Enums"]["billing_period"]
        }
        Returns: string
      }
      close_expired_plans: { Args: never; Returns: undefined }
      compute_invoice_totals: {
        Args: { p_subscription_id: string }
        Returns: {
          applied_discount_id: string
          discount_total: number
          subtotal: number
          tax_total: number
          total: number
        }[]
      }
      current_role_name: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      dashboard_kpis: {
        Args: never
        Returns: {
          active_subscriptions: number
          arr: number
          mrr: number
          outstanding: number
          overdue_count: number
          revenue_collected: number
        }[]
      }
      discount_is_eligible: {
        Args: { p_as_of: string; p_discount_id: string }
        Returns: boolean
      }
      invoice_ageing_buckets: {
        Args: never
        Returns: {
          bucket: string
          invoice_count: number
          total_due: number
        }[]
      }
      invoice_cancel: {
        Args: { p_invoice_id: string }
        Returns: {
          amount_due: number | null
          amount_paid: number
          applied_discount_id: string | null
          created_at: string
          customer_id: string
          discount_total: number
          due_date: string
          id: string
          issue_date: string
          number: string
          period_end: string
          period_start: string
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subscription_id: string
          subtotal: number
          tax_total: number
          total: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      invoice_confirm: {
        Args: { p_invoice_id: string }
        Returns: {
          amount_due: number | null
          amount_paid: number
          applied_discount_id: string | null
          created_at: string
          customer_id: string
          discount_total: number
          due_date: string
          id: string
          issue_date: string
          number: string
          period_end: string
          period_start: string
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subscription_id: string
          subtotal: number
          tax_total: number
          total: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff_or_admin: { Args: never; Returns: boolean }
      next_number: {
        Args: { p_prefix: string; p_width?: number }
        Returns: string
      }
      product_effective_price: {
        Args: { p_product_id: string; p_variant_value_ids: string[] }
        Returns: number
      }
      record_payment: {
        Args: {
          p_amount: number
          p_invoice_id: string
          p_method: Database["public"]["Enums"]["payment_method"]
          p_note?: string
          p_provider?: string
          p_provider_payment_id?: string
          p_recorded_by?: string
          p_reference?: string
          p_status: Database["public"]["Enums"]["payment_status"]
          p_verification_level?: number
        }
        Returns: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          method: Database["public"]["Enums"]["payment_method"]
          note: string | null
          paid_on: string
          provider: string | null
          provider_payment_id: string | null
          recorded_by: string | null
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verification_level: number
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      renew_subscription: {
        Args: { p_subscription_id: string }
        Returns: {
          closed_reason: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          expiry_date: string | null
          id: string
          next_billing_date: string | null
          number: string
          payment_terms: number
          plan_id: string
          quote_valid_until: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          template_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      revenue_by_month: {
        Args: { p_months?: number }
        Returns: {
          month: string
          revenue: number
        }[]
      }
      run_billing: {
        Args: { p_as_of?: string; p_dry_run?: boolean }
        Returns: string
      }
      subscription_transition_allowed: {
        Args: {
          p_from: Database["public"]["Enums"]["subscription_status"]
          p_plan_id: string
          p_to: Database["public"]["Enums"]["subscription_status"]
        }
        Returns: boolean
      }
      transition_subscription: {
        Args: {
          p_reason?: string
          p_subscription_id: string
          p_to: Database["public"]["Enums"]["subscription_status"]
        }
        Returns: {
          closed_reason: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          expiry_date: string | null
          id: string
          next_billing_date: string | null
          number: string
          payment_terms: number
          plan_id: string
          quote_valid_until: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          template_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "subscriptions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
      applies_to: "all" | "product"
      billing_period: "daily" | "weekly" | "monthly" | "yearly"
      discount_applies_to: "products" | "subscriptions"
      discount_kind: "fixed" | "percent"
      invoice_status: "draft" | "confirmed" | "paid" | "cancelled"
      payment_method:
        | "cash"
        | "bank_transfer"
        | "cheque"
        | "card"
        | "upi"
        | "youpi"
        | "other"
      payment_status: "pending" | "confirmed" | "failed" | "refunded"
      product_type: "service" | "software" | "addon" | "physical"
      subscription_status:
        | "draft"
        | "quotation"
        | "confirmed"
        | "active"
        | "paused"
        | "closed"
      tax_type: "percent" | "fixed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "staff", "customer"],
      applies_to: ["all", "product"],
      billing_period: ["daily", "weekly", "monthly", "yearly"],
      discount_applies_to: ["products", "subscriptions"],
      discount_kind: ["fixed", "percent"],
      invoice_status: ["draft", "confirmed", "paid", "cancelled"],
      payment_method: [
        "cash",
        "bank_transfer",
        "cheque",
        "card",
        "upi",
        "youpi",
        "other",
      ],
      payment_status: ["pending", "confirmed", "failed", "refunded"],
      product_type: ["service", "software", "addon", "physical"],
      subscription_status: [
        "draft",
        "quotation",
        "confirmed",
        "active",
        "paused",
        "closed",
      ],
      tax_type: ["percent", "fixed"],
    },
  },
} as const

