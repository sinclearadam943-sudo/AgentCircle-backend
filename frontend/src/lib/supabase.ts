import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zbatlfipquqtxsoaxkvc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYXRsZmlwcXVxdHhzb2F4a3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0OTU5NjAsImV4cCI6MjA4NTA3MTk2MH0.zTpKo_iAbhD0Gv_YATPRnKyTsANHFg5We4CqzTB9xG8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
