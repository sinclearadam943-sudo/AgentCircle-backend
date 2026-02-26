import { supabase } from '../lib/supabase'

export async function GET() {
  try {
    // 获取角色总数
    const { count: totalRoles, error: rolesError } = await supabase
      .from('roles')
      .select('*', { count: 'exact', head: true })

    // 获取行为总数
    const { count: totalBehaviors, error: behaviorsError } = await supabase
      .from('daily_acts')
      .select('*', { count: 'exact', head: true })

    // 获取记忆总数
    const { count: totalMemories, error: memoriesError } = await supabase
      .from('role_memories')
      .select('*', { count: 'exact', head: true })

    // 获取今日行为数
    const today = new Date().toISOString().split('T')[0]
    const { count: todayBehaviors, error: todayError } = await supabase
      .from('daily_acts')
      .select('*', { count: 'exact', head: true })
      .eq('act_date', today)

    if (rolesError || behaviorsError || memoriesError || todayError) {
      console.error('Supabase errors:', { rolesError, behaviorsError, memoriesError, todayError })
    }

    return Response.json({
      total_roles: totalRoles || 0,
      total_behaviors: totalBehaviors || 0,
      total_memories: totalMemories || 0,
      today_behaviors: todayBehaviors || 0
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
