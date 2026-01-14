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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          listing_id: string | null
          listing_type: string | null
          participant_one: string
          participant_two: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          listing_id?: string | null
          listing_type?: string | null
          participant_one: string
          participant_two: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          listing_id?: string | null
          listing_type?: string | null
          participant_one?: string
          participant_two?: string
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          payment_status: string
          status: string
          ticket_count: number
          total_amount: number
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          payment_status?: string
          status?: string
          ticket_count?: number
          total_amount?: number
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          payment_status?: string
          status?: string
          ticket_count?: number
          total_amount?: number
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number
          category: string
          created_at: string
          description: string
          event_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_free: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          organizer_id: string
          price: number
          tickets_sold: number
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          category?: string
          created_at?: string
          description: string
          event_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          organizer_id: string
          price?: number
          tickets_sold?: number
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          category?: string
          created_at?: string
          description?: string
          event_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          organizer_id?: string
          price?: number
          tickets_sold?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          listing_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          listing_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          listing_type?: string
          user_id?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          category: string
          condition: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean | null
          is_sold: boolean | null
          latitude: number | null
          longitude: number | null
          price: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          condition?: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_sold?: boolean | null
          latitude?: number | null
          longitude?: number | null
          price: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          condition?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_sold?: boolean | null
          latitude?: number | null
          longitude?: number | null
          price?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      mpesa_callbacks: {
        Row: {
          amount: number | null
          checkout_request_id: string
          created_at: string
          id: string
          merchant_request_id: string | null
          mpesa_receipt_number: string | null
          phone_number: string | null
          processed: boolean
          raw_callback: Json | null
          result_code: number | null
          result_desc: string | null
          transaction_date: string | null
        }
        Insert: {
          amount?: number | null
          checkout_request_id: string
          created_at?: string
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number?: string | null
          processed?: boolean
          raw_callback?: Json | null
          result_code?: number | null
          result_desc?: string | null
          transaction_date?: string | null
        }
        Update: {
          amount?: number | null
          checkout_request_id?: string
          created_at?: string
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number?: string | null
          processed?: boolean
          raw_callback?: Json | null
          result_code?: number | null
          result_desc?: string | null
          transaction_date?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      phone_verification_codes: {
        Row: {
          attempts: number | null
          code: string
          created_at: string
          expires_at: string
          id: string
          phone_number: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          phone_number: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone_number?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          source: string
          started_at: string
          tier: Database["public"]["Enums"]["seller_tier"]
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          source?: string
          started_at?: string
          tier: Database["public"]["Enums"]["seller_tier"]
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          source?: string
          started_at?: string
          tier?: Database["public"]["Enums"]["seller_tier"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string
          full_name: string | null
          graduation_year: number | null
          id: string
          major: string | null
          phone_number: string | null
          phone_verified: boolean | null
          referral_code: string | null
          referred_by: string | null
          university: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          graduation_year?: number | null
          id: string
          major?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          graduation_year?: number | null
          id?: string
          major?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          university?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          credit_amount: number | null
          credited_at: string | null
          id: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          credit_amount?: number | null
          credited_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          credit_amount?: number | null
          credited_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          listing_id: string | null
          listing_type: string | null
          reason: string
          reported_user_id: string | null
          reporter_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          listing_id?: string | null
          listing_type?: string | null
          reason: string
          reported_user_id?: string | null
          reporter_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          listing_id?: string | null
          listing_type?: string | null
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_verified_purchase: boolean
          rating: number
          reviewer_id: string | null
          seller_id: string
          transaction_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean
          rating: number
          reviewer_id?: string | null
          seller_id: string
          transaction_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean
          rating?: number
          reviewer_id?: string | null
          seller_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_profiles: {
        Row: {
          active_listings_count: number
          average_rating: number
          commission_rate: number
          completed_orders: number
          created_at: string
          disputes_count: number
          id: string
          in_app_completion_rate: number
          is_verified: boolean
          max_active_listings: number
          search_boost_score: number
          tier: Database["public"]["Enums"]["seller_tier"]
          tier_expires_at: string | null
          total_ratings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_listings_count?: number
          average_rating?: number
          commission_rate?: number
          completed_orders?: number
          created_at?: string
          disputes_count?: number
          id?: string
          in_app_completion_rate?: number
          is_verified?: boolean
          max_active_listings?: number
          search_boost_score?: number
          tier?: Database["public"]["Enums"]["seller_tier"]
          tier_expires_at?: string | null
          total_ratings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_listings_count?: number
          average_rating?: number
          commission_rate?: number
          completed_orders?: number
          created_at?: string
          disputes_count?: number
          id?: string
          in_app_completion_rate?: number
          is_verified?: boolean
          max_active_listings?: number
          search_boost_score?: number
          tier?: Database["public"]["Enums"]["seller_tier"]
          tier_expires_at?: string | null
          total_ratings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          price: number
          price_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          price: number
          price_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          price?: number
          price_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          auto_release_at: string | null
          buyer_confirmed: boolean
          buyer_id: string | null
          card_transaction_id: string | null
          completed_at: string | null
          created_at: string
          delivered_at: string | null
          dispute_reason: string | null
          dispute_resolution: string | null
          disputed_at: string | null
          escrow_released_at: string | null
          id: string
          is_rated: boolean
          listing_id: string
          listing_title: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          mpesa_checkout_request_id: string | null
          mpesa_receipt_number: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          platform_fee: number
          seller_amount: number
          seller_confirmed_delivery: boolean
          seller_id: string
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          auto_release_at?: string | null
          buyer_confirmed?: boolean
          buyer_id?: string | null
          card_transaction_id?: string | null
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          dispute_reason?: string | null
          dispute_resolution?: string | null
          disputed_at?: string | null
          escrow_released_at?: string | null
          id?: string
          is_rated?: boolean
          listing_id: string
          listing_title: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          mpesa_checkout_request_id?: string | null
          mpesa_receipt_number?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          platform_fee?: number
          seller_amount?: number
          seller_confirmed_delivery?: boolean
          seller_id: string
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          auto_release_at?: string | null
          buyer_confirmed?: boolean
          buyer_id?: string | null
          card_transaction_id?: string | null
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          dispute_reason?: string | null
          dispute_resolution?: string | null
          disputed_at?: string | null
          escrow_released_at?: string | null
          id?: string
          is_rated?: boolean
          listing_id?: string
          listing_title?: string
          listing_type?: Database["public"]["Enums"]["listing_type"]
          mpesa_checkout_request_id?: string | null
          mpesa_receipt_number?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          platform_fee?: number
          seller_amount?: number
          seller_confirmed_delivery?: boolean
          seller_id?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          available_balance: number
          created_at: string
          escrow_balance: number
          id: string
          total_earned: number
          total_fees_paid: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string
          escrow_balance?: number
          id?: string
          total_earned?: number
          total_fees_paid?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string
          escrow_balance?: number
          id?: string
          total_earned?: number
          total_fees_paid?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          created_at: string
          id: string
          mpesa_transaction_id: string | null
          notes: string | null
          phone_number: string
          processed_at: string | null
          processed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          mpesa_transaction_id?: string | null
          notes?: string | null
          phone_number: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          mpesa_transaction_id?: string | null
          notes?: string | null
          phone_number?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          graduation_year: number | null
          id: string | null
          major: string | null
          university: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string | null
          major?: string | null
          university?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          graduation_year?: number | null
          id?: string | null
          major?: string | null
          university?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_to_escrow: {
        Args: {
          _checkout_request_id: string
          _receipt_number: string
          _transaction_id: string
        }
        Returns: undefined
      }
      check_trusted_seller_eligibility: {
        Args: { _user_id: string }
        Returns: undefined
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
      app_role: "admin" | "moderator" | "user"
      listing_type: "item" | "service"
      payment_method: "mpesa" | "card"
      seller_tier: "free" | "premium" | "trusted"
      transaction_status:
        | "pending_payment"
        | "paid_escrow"
        | "delivered"
        | "completed"
        | "disputed"
        | "refunded"
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
      app_role: ["admin", "moderator", "user"],
      listing_type: ["item", "service"],
      payment_method: ["mpesa", "card"],
      seller_tier: ["free", "premium", "trusted"],
      transaction_status: [
        "pending_payment",
        "paid_escrow",
        "delivered",
        "completed",
        "disputed",
        "refunded",
        "cancelled",
      ],
    },
  },
} as const
