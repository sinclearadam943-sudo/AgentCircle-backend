// 模拟角色统计数据
const mockRoleStats = {
  camp_distribution: [
    { camp: '现代都市', count: 3 },
    { camp: '古代江湖', count: 2 }
  ]
}

export async function GET() {
  return Response.json(mockRoleStats)
}
