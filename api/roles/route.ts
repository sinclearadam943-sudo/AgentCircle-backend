import { supabase } from '../lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('role_id')

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
