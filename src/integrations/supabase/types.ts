export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          address: Json
          contact: Json
          created_at: string
          id: string
          name: string
          org_number: string | null
          reference: string | null
          updated_at: string
          user_id: string
          vat_number: string | null
        }
        Insert: {
          address?: Json
          contact?: Json
          created_at?: string
          id?: string
          name: string
          org_number?: string | null
          reference?: string | null
          updated_at?: string
          user_id: string
          vat_number?: string | null
        }
        Update: {
          address?: Json
          contact?: Json
          created_at?: string
          id?: string
          name?: string
          org_number?: string | null
          reference?: string | null
          updated_at?: string
          user_id?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          currency: string
          customer_id: string
          customer_reference: string | null
          date: string
          due_date: string
          id: string
          invoice_number: string
          is_credit: boolean
          items: Json
          language: string
          notes: string | null
          payment_terms: string
          reference: string | null
          status: string
          total_gross: number
          total_net: number
          total_tax: number
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id: string
          customer_reference?: string | null
          date: string
          due_date: string
          id?: string
          invoice_number: string
          is_credit?: boolean
          items?: Json
          language?: string
          notes?: string | null
          payment_terms: string
          reference?: string | null
          status?: string
          total_gross?: number
          total_net?: number
          total_tax?: number
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string
          customer_reference?: string | null
          date?: string
          due_date?: string
          id?: string
          invoice_number?: string
          is_credit?: boolean
          items?: Json
          language?: string
          notes?: string | null
          payment_terms?: string
          reference?: string | null
          status?: string
          total_gross?: number
          total_net?: number
          total_tax?: number
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company: Json
          created_at: string
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          company?: Json
          created_at?: string
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          company?: Json
          created_at?: string
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
