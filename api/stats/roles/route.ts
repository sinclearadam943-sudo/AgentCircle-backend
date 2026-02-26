import { supabase } from '../../lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('role_camp')

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // 统计阵营分布
    const campStats: Record<string, number> = {}
    data?.forEach(role => {
      const camp = role.role_camp || '未知'
      campStats[camp] = (campStats[camp] || 0) + 1
    })

    const campDistribution = Object.entries(campStats).map(([camp, count]) => ({
      camp,
      count
    }))

    return Response.json({
      camp_distribution: campDistribution
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
