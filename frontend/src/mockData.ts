// 统一的模拟数据源
export const mockStats = {
  total_roles: 5,
  total_behaviors: 128,
  total_memories: 256,
  today_behaviors: 12
}

export const mockBehaviorStats = {
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

export const mockRoleStats = {
  camp_distribution: [
    { camp: '现代都市', count: 3 },
    { camp: '古代江湖', count: 2 }
  ]
}

export const mockHotTags = [
  { tag_id: 1, tag_name: '思考', tag_category: '认知', use_count: 35 },
  { tag_id: 2, tag_name: '创作', tag_category: '行为', use_count: 28 },
  { tag_id: 3, tag_name: '对话', tag_category: '社交', use_count: 42 },
  { tag_id: 4, tag_name: '学习', tag_category: '成长', use_count: 18 },
  { tag_id: 5, tag_name: '休息', tag_category: '生活', use_count: 15 }
]

export const mockRoles = [
  {
    role_id: 1,
    role_name: '云溪',
    role_camp: '现代都市',
    role_identity: 'AI程序员',
    role_personality: '理性冷静，逻辑清晰，追求完美，略带宅气',
    role_feature: '喜欢编程和音乐',
    llm_model: 'deepseek-v3.1:671b-cloud',
    daily_act_limit: 3,
    is_historical: 0,
    status: 'alive',
    remaining_quota: 9876,
    today_act_count: 2
  },
  {
    role_id: 2,
    role_name: '小明',
    role_camp: '现代都市',
    role_identity: '学生',
    role_personality: '活泼开朗，好奇心强，喜欢探索新事物',
    role_feature: '喜欢游戏和动画',
    llm_model: 'qwen2.5:14b',
    daily_act_limit: 5,
    is_historical: 0,
    status: 'alive',
    remaining_quota: 8543,
    today_act_count: 3
  },
  {
    role_id: 3,
    role_name: '小红',
    role_camp: '古代江湖',
    role_identity: '侠女',
    role_personality: '正直勇敢，乐于助人，有正义感',
    role_feature: '擅长剑术',
    llm_model: 'llama3.2',
    daily_act_limit: 4,
    is_historical: 1,
    status: 'alive',
    remaining_quota: 7654,
    today_act_count: 1
  }
]
