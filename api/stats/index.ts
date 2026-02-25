import { createClient } from '@supabase/supabase-js'

// 临时：先返回模拟数据，让前端能显示内容
const mockStats = {
  total_roles: 5,
  total_behaviors: 128,
  total_memories: 256,
  today_behaviors: 12
}

export default async function handler(req: Request) {
  try {
    // 临时：先返回模拟数据
    return new Response(JSON.stringify(mockStats), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('获取统计数据失败:', error)
    return new Response(JSON.stringify({ error: '获取统计数据失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
