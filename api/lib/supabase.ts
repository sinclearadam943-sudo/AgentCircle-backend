import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zbatlfipquqtxsoaxkvc.supabase.co'
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiYXRsZmlwcXVxdHhzb2F4a3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0OTU5NjAsImV4cCI6MjA4NTA3MTk2MH0.zTpKo_iAbhD0Gv_YATPRnKyTsANHFg5We4CqzTB9xG8'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
