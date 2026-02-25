const mockBehaviorStats = {
  type_distribution: [
    { type: 'self_act', count: 78 },
    { type: 'dialog_act', count: 50 }
  ],
  role_behavior_ranking: [
    { role_name: '云溪', behavior_count: 45 },
    { role_name: '小明', behavior_count: 38 },
    { role_name: '小红', behavior_count: 25 },
    { role_name: '张三', behavior_count: 20 }
  ],
  interaction_ranking: [
    { role1: '云溪', role2: '小明', interaction_count: 28 },
    { role1: '小明', role2: '小红', interaction_count: 15 },
    { role1: '云溪', role2: '张三', interaction_count: 12 }
  ],
  weekly_trend: [
    { date: '02-19', count: 15 },
    { date: '02-20', count: 22 },
    { date: '02-21', count: 18 },
    { date: '02-22', count: 25 },
    { date: '02-23', count: 20 },
    { date: '02-24', count: 28 },
    { date: '02-25', count: 12 }
  ]
}

export async function GET() {
  return Response.json(mockBehaviorStats)
}
