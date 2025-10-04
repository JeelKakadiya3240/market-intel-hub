import { createClient } from '@supabase/supabase-js';

// Enhanced environment variable handling with fallback support
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

// Enhanced validation for required environment variables with actionable error messages
function validateClientConfig(): void {
  if (!supabaseUrl) {
    console.error('❌ Supabase configuration error: Missing URL');
    console.error('📋 Available environment variables:', Object.keys(import.meta.env));
    throw new Error(
      "Missing Supabase URL environment variable - the app requires VITE_SUPABASE_URL to initialize the Supabase client but it's not accessible at runtime. Please configure this variable in your deployment secrets."
    );
  }

  if (!supabaseAnonKey) {
    console.error('❌ Supabase configuration error: Missing Anon Key');
    console.error('📋 Available environment variables:', Object.keys(import.meta.env));
    throw new Error(
      "Missing Supabase Anon Key environment variable - the app requires VITE_SUPABASE_ANON_KEY to initialize the Supabase client but it's not accessible at runtime. Please configure this variable in your deployment secrets."
    );
  }

  console.log('✅ Client-side Supabase configuration validated successfully');
}

// Initialize Supabase client with proper error handling
let supabase: any = null;

try {
  validateClientConfig();
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error);
  // Re-throw to prevent silent failures
  throw error;
}

export { supabase };

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          username: string;
          password: string;
          email: string | null;
          role: string | null;
          created_at: string | null;
        };
        Insert: {
          username: string;
          password: string;
          email?: string | null;
          role?: string | null;
        };
        Update: {
          username?: string;
          password?: string;
          email?: string | null;
          role?: string | null;
        };
      };
      accelerators: {
        Row: {
          id: number;
          name: string | null;
          website: string | null;
          country: string | null;
          city: string | null;
          industries: string | null;
          founders: string | null;
          founded_date: string | null;
          number_of_investments: number | null;
          number_of_exits: number | null;
        };
      };
      companies_startups: {
        Row: {
          id: number;
          image: string | null;
          name: string | null;
          country: string | null;
          state: string | null;
          rank: string | null;
          short_description: string | null;
          long_description: string | null;
          website: string | null;
          founded: string | null;
          tags: string | null;
          funding_table: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      events: {
        Row: {
          id: number;
          event_name: string | null;
          location: string | null;
          start_date: string | null;
          end_date: string | null;
          event_type: string | null;
          link: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
      funding_rounds_exits: {
        Row: {
          id: number;
          company: string | null;
          exit_value_billions: number | null;
          exit_type: string | null;
          total_funding_millions: number | null;
          industry: string | null;
          deal_closed_date: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
      };
    };
  };
};
