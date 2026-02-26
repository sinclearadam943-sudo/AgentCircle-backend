import { supabase } from '../../lib/supabase'

export async function GET() {
  try {
    // 获取所有行为数据
    const { data: behaviors, error: behaviorsError } = await supabase
      .from('daily_acts')
      .select(`
        *,
        roles!daily_acts_role_id_fkey (role_name),
        target_roles:roles!daily_acts_target_role_id_fkey (role_name)
      `)
      .order('act_time', { ascending: false })

    if (behaviorsError) {
      console.error('Supabase error:', behaviorsError)
      return Response.json({ error: behaviorsError.message }, { status: 500 })
    }

    // 统计行为类型分布
    const typeStats: Record<string, number> = {}
    behaviors?.forEach(act => {
      const type = act.act_type || 'unknown'
      typeStats[type] = (typeStats[type] || 0) + 1
    })
    const typeDistribution = Object.entries(typeStats).map(([type, count]) => ({ type, count }))

    // 统计角色行为排名
    const roleBehaviorStats: Record<string, number> = {}
    behaviors?.forEach(act => {
      const roleName = act.roles?.role_name || '未知'
      roleBehaviorStats[roleName] = (roleBehaviorStats[roleName] || 0) + 1
    })
    const roleBehaviorRanking = Object.entries(roleBehaviorStats)
      .map(([role_name, behavior_count]) => ({ role_name, behavior_count }))
      .sort((a, b) => b.behavior_count - a.behavior_count)
      .slice(0, 10)

    // 统计每周趋势（最近7天）
    const weeklyTrend: { date: string; count: number }[] = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = behaviors?.filter(act => act.act_date === dateStr).length || 0
      weeklyTrend.push({
        date: dateStr.slice(5), // 只保留 MM-DD
        count
      })
    }

    return Response.json({
      type_distribution: typeDistribution,
      role_behavior_ranking: roleBehaviorRanking,
      interaction_ranking: [], // 暂时留空
      weekly_trend: weeklyTrend
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
