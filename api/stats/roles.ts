// 模拟角色统计数据
const mockRoleStats = {
  camp_distribution: [
    { camp: '现代都市', count: 3 },
    { camp: '古代江湖', count: 2 }
  ]
}

export default async function handler(req: Request) {
  return new Response(JSON.stringify(mockRoleStats), {
    headers: { 'Content-Type': 'application/json' }
  })
}
