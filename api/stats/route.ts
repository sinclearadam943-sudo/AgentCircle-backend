import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 模拟数据
const mockStats = {
  total_roles: 5,
  total_behaviors: 128,
  total_memories: 256,
  today_behaviors: 12
}

export async function GET() {
  return Response.json(mockStats)
}
