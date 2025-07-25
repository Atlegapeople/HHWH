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
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          consultation_type: string
          payment_method: string
          payment_status: string
          medical_aid_scheme: string | null
          medical_aid_number: string | null
          appointment_status: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          appointment_time: string
          consultation_type: string
          payment_method: string
          payment_status: string
          medical_aid_scheme?: string | null
          medical_aid_number?: string | null
          appointment_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_date?: string
          appointment_time?: string
          consultation_type?: string
          payment_method?: string
          payment_status?: string
          medical_aid_scheme?: string | null
          medical_aid_number?: string | null
          appointment_status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
      }
      doctors: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          specialization: string | null
          qualification: string | null
          hpcsa_number: string | null
          consultation_fee: number
          bio: string | null
          profile_image_url: string | null
          available_days: string[]
          available_hours: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name: string
          specialization?: string | null
          qualification?: string | null
          hpcsa_number?: string | null
          consultation_fee?: number
          bio?: string | null
          profile_image_url?: string | null
          available_days?: string[]
          available_hours?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string
          specialization?: string | null
          qualification?: string | null
          hpcsa_number?: string | null
          consultation_fee?: number
          bio?: string | null
          profile_image_url?: string | null
          available_days?: string[]
          available_hours?: Json
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          date_of_birth: string
          gender: string
          address_line_1: string
          address_line_2: string | null
          city: string
          province: string
          postal_code: string
          country: string
          medical_aid_scheme: string | null
          medical_aid_number: string | null
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship: string
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          date_of_birth: string
          gender: string
          address_line_1: string
          address_line_2?: string | null
          city: string
          province: string
          postal_code: string
          country?: string
          medical_aid_scheme?: string | null
          medical_aid_number?: string | null
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          date_of_birth?: string
          gender?: string
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          province?: string
          postal_code?: string
          country?: string
          medical_aid_scheme?: string | null
          medical_aid_number?: string | null
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relationship?: string
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          appointment_id: string
          payment_method: string
          payment_gateway_id: string
          amount: number
          payment_status: string
          gateway_response: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          payment_method: string
          payment_gateway_id: string
          amount: number
          payment_status?: string
          gateway_response?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          payment_method?: string
          payment_gateway_id?: string
          amount?: number
          payment_status?: string
          gateway_response?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          }
        ]
      }
      symptom_assessments: {
        Row: {
          id: string
          patient_id: string
          assessment_data: Json
          risk_factors: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          assessment_data: Json
          risk_factors?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          assessment_data?: Json
          risk_factors?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "symptom_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          }
        ]
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never