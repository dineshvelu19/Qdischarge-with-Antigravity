export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          name: string
          age: number
          gender: string
          ward: string
          bed: string
          admission_diagnosis: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          age: number
          gender: string
          ward: string
          bed: string
          admission_diagnosis: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          gender?: string
          ward?: string
          bed?: string
          admission_diagnosis?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      discharges: {
        Row: {
          id: string
          patient_id: string
          physician_id: string
          edt: string | null
          transport_mode: string | null
          disposition: string | null
          status: string
          clinical_readiness: Json
          summary_draft: Json
          signed_at: string | null
          signed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          physician_id: string
          edt?: string | null
          transport_mode?: string | null
          disposition?: string | null
          status?: string
          clinical_readiness?: Json
          summary_draft?: Json
          signed_at?: string | null
          signed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          physician_id?: string
          edt?: string | null
          transport_mode?: string | null
          disposition?: string | null
          status?: string
          clinical_readiness?: Json
          summary_draft?: Json
          signed_at?: string | null
          signed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
