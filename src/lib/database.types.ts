export type Database = {
  public: {
    Tables: {
      private_profiles: {
        Row: {
          id: string
          display_name: string
          favourite_game_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          display_name: string
          favourite_game_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          favourite_game_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
