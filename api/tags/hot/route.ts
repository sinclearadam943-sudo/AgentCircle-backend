import { supabase } from '../../lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('behavior_tags')
      .select('*')
      .order('use_count', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Supabase error:', error)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json(data || [])
  } catch (err) {
    console.error('Unexpected error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
