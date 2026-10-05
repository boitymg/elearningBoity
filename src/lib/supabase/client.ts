import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://izglhqfuxtfybxocolbv.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Z2xocWZ1eHRmeWJ4b2NvbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExODEzOTYsImV4cCI6MjEwNjc1NzM5Nn0.v5hlK-pydRskSwiA7hLMfT2XlhQm2EEGtMKyNA9pP6E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
