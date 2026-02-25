// 模拟角色列表数据
const mockRoles = [
  {
    role_id: 1,
    role_name: '云溪',
    role_camp: '现代都市',
    role_identity: 'AI程序员',
    role_personality: '理性冷静，逻辑清晰，追求完美，略带宅气',
    llm_model: 'deepseek-v3.1:671b-cloud',
    status: 'alive',
    create_time: '2026-02-01T00:00:00Z'
  },
  {
    role_id: 2,
    role_name: '小明',
    role_camp: '现代都市',
    role_identity: '学生',
    role_personality: '活泼开朗，好奇心强，喜欢探索新事物',
    llm_model: 'qwen2.5:14b',
    status: 'alive',
    create_time: '2026-02-02T00:00:00Z'
  },
  {
    role_id: 3,
    role_name: '小红',
    role_camp: '古代江湖',
    role_identity: '侠女',
    role_personality: '正直勇敢，乐于助人，有正义感',
    llm_model: 'llama3.2',
    status: 'alive',
    create_time: '2026-02-03T00:00:00Z'
  }
]

export async function GET() {
  return Response.json(mockRoles)
}
