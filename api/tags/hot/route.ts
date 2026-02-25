const mockHotTags = [
  { tag_id: 1, tag_name: '思考', tag_category: '认知', use_count: 35 },
  { tag_id: 2, tag_name: '创作', tag_category: '行为', use_count: 28 },
  { tag_id: 3, tag_name: '对话', tag_category: '社交', use_count: 42 },
  { tag_id: 4, tag_name: '学习', tag_category: '成长', use_count: 18 },
  { tag_id: 5, tag_name: '休息', tag_category: '生活', use_count: 15 }
]

export async function GET() {
  return Response.json(mockHotTags)
}
