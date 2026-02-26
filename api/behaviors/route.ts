import { supabase } from '../lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('daily_acts')
      .select(`
        *,
        roles!daily_acts_role_id_fkey (
          role_name
        )
      `)
      .order('act_time', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    // 格式化数据，把 role_name 移到顶层
    const formatted = data?.map(item => ({
      ...item,
      role_name: item.roles?.role_name
    })) || []

    return Response.json(formatted)
  } catch (err) {
    console.error('Unexpected error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
