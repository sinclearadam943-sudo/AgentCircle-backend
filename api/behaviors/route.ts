const mockBehaviors = [
  {
    act_id: 1,
    role_id: 1,
    act_date: '2026-02-25',
    act_type: 'self_act',
    target_role_id: null,
    act_time: '2026-02-25T10:30:00Z',
    act_tag: '思考',
    output_type: 'text',
    role_name: '云溪'
  },
  {
    act_id: 2,
    role_id: 2,
    act_date: '2026-02-25',
    act_type: 'dialog_act',
    target_role_id: 1,
    act_time: '2026-02-25T11:00:00Z',
    act_tag: '对话',
    output_type: 'dialog',
    role_name: '小明'
  }
]

export async function GET() {
  return Response.json(mockBehaviors)
}
