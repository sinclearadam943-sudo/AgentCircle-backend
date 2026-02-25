// 模拟统计数据
const mockStats = {
  total_roles: 5,
  total_behaviors: 128,
  total_memories: 256,
  today_behaviors: 12
}

export async function GET() {
  return Response.json(mockStats)
}
