import { useState, useEffect } from 'react'
import axios from 'axios'

interface RoleDetailPageProps {
  roleId: string
  onBack: () => void
}

interface Quota {
  used: number
  remaining: number
  total: number
}

interface Post {
  id: string
  content: string
  type: string
  created_at: string
}

interface Comment {
  id: string
  to_role: {
    id: string
    name: string
    avatar: string
  }
  content: string
  created_at: string
}

interface TimelineEvent {
  id: string
  time: string
  type: string
  description: string
  content: string
}

interface RoleData {
  id: string
  name: string
  title: string
  description: string
  model: string
  quota: Quota
  todayActs: number
  activityLevel: string
  tags: string[]
  avatar: string
  posts: Post[]
  comments: Comment[]
  timeline: TimelineEvent[]
}

// 生成角色头像
const generateAvatar = (roleName: string): string => {
  const prompt = `${roleName} AI character traditional Chinese painting style`
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square`
}

const RoleDetailPage: React.FC<RoleDetailPageProps> = ({ roleId, onBack }) => {
  const [roleData, setRoleData] = useState<RoleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'timeline'>('posts')

  useEffect(() => {
    const fetchRoleData = async () => {
      try {
        // 获取角色基本信息
        const roleRes = await axios.get(`/api/roles/${roleId}`)
        const roleInfo = roleRes.data

        // 获取角色额度信息
        const quotaRes = await axios.get(`/api/roles/${roleId}/quota`)
        const quotaInfo = quotaRes.data

        // 获取角色行为记录（作为帖子和时间线）
        const behaviorsRes = await axios.get(`/api/behaviors`)
        const behaviorsData = behaviorsRes.data || []

        // 过滤出当前角色的行为
        const roleBehaviors = behaviorsData.filter((behavior: any) => behavior.role_id === parseInt(roleId))

        // 构建帖子数据（获取行为详情，过滤掉对话行为）
        const postsData = await Promise.all(
          roleBehaviors
            .filter((behavior: any) => behavior.act_type !== 'dialog_act') // 过滤掉对话行为
            .map(async (behavior: any) => {
              try {
                // 获取行为详情
                const detailsRes = await axios.get(`/api/behaviors/${behavior.act_id}/details`)
                const detailsData = detailsRes.data
                
                // 构建内容
                let content = '暂无内容'
                if (behavior.act_type === 'self_act' && detailsData.detail) {
                  content = detailsData.detail.self_act_content || '暂无内容'
                }
                
                return {
                  id: behavior.act_id.toString(),
                  content: content,
                  type: behavior.act_tag || '行为',
                  created_at: behavior.act_time || new Date().toISOString()
                }
              } catch {
                // 如果获取详情失败，使用基本信息
                return {
                  id: behavior.act_id.toString(),
                  content: behavior.act_content || '暂无内容',
                  type: behavior.act_tag || '行为',
                  created_at: behavior.act_time || new Date().toISOString()
                }
              }
            })
        )

        // 构建评论数据（使用记忆数据或模拟数据）
        let commentsData = []
        try {
          const memoriesRes = await axios.get(`/api/memories?role_id=${roleId}`)
          const memoriesData = memoriesRes.data || []
          // 构建评论数据
          commentsData = memoriesData.map((memory: any) => ({
            id: memory.memory_id.toString(),
            to_role: {
              id: memory.to_role_id || '1',
              name: memory.to_role_name || '其他角色',
              avatar: generateAvatar(memory.to_role_name || '其他角色')
            },
            content: memory.memory_content || '暂无内容',
            created_at: memory.create_time || new Date().toISOString()
          }))
          
          // 如果没有评论数据，增加模拟评论
          if (commentsData.length === 0) {
            commentsData = generateMockComments(roleInfo.role_name)
          }
        } catch {
          // 如果获取记忆失败，使用模拟评论数据
          commentsData = generateMockComments(roleInfo.role_name)
        }

        // 构建时间线数据（获取行为详情）
        const timelineData = await Promise.all(
          roleBehaviors.map(async (behavior: any) => {
            try {
              // 获取行为详情
              const detailsRes = await axios.get(`/api/behaviors/${behavior.act_id}/details`)
              const detailsData = detailsRes.data
              
              // 构建内容
              let content = '暂无内容'
              if (behavior.act_type === 'self_act' && detailsData.detail) {
                content = detailsData.detail.act_content || '暂无内容'
              } else if (behavior.act_type === 'dialog_act' && detailsData.dialogs) {
                // 构建对话内容
                content = detailsData.dialogs.map((dialog: any) => {
                  return `${dialog.speaker_name}: ${dialog.dialog_content}`
                }).join('\n')
              }
              
              return {
                id: behavior.act_id.toString(),
                time: behavior.act_time || new Date().toLocaleString(),
                type: behavior.act_type || '行为',
                description: behavior.act_tag || '行为记录',
                content: content
              }
            } catch {
              // 如果获取详情失败，使用基本信息
              return {
                id: behavior.act_id.toString(),
                time: behavior.act_time || new Date().toLocaleString(),
                type: behavior.act_type || '行为',
                description: behavior.act_tag || '行为记录',
                content: behavior.act_content || '暂无内容'
              }
            }
          })
        )

        // 构建角色数据
        const roleData: RoleData = {
          id: roleId,
          name: roleInfo.role_name,
          title: roleInfo.role_identity || '未知',
          description: roleInfo.role_personality || '暂无描述',
          model: roleInfo.llm_model || 'qwen3:0.6b',
          quota: {
            used: quotaInfo.used_quota || 0,
            remaining: quotaInfo.remaining_quota || 0,
            total: (quotaInfo.used_quota || 0) + (quotaInfo.remaining_quota || 0)
          },
          todayActs: roleInfo.today_act_count || 0,
          activityLevel: calculateActivityLevel(roleInfo.today_act_count || 0),
          tags: generateTagsFromRole(roleInfo),
          avatar: generateAvatar(roleInfo.role_name),
          posts: postsData,
          comments: commentsData,
          timeline: timelineData
        }

        setRoleData(roleData)
      } catch (error) {
        console.error('获取角色数据失败:', error)
        // 使用模拟数据作为备份
        setRoleData(generateMockData(roleId))
      } finally {
        setLoading(false)
      }
    }

    // 生成模拟评论
    const generateMockComments = (roleName: string) => {
      const otherRoles = ['李白', '杜甫', '苏轼', '李清照', '陶渊明', '屈原']
      return Array.from({ length: 2 }, (_, i) => ({
        id: `comment-${i}`,
        to_role: {
          id: `${i + 1}`,
          name: otherRoles[i % otherRoles.length],
          avatar: generateAvatar(otherRoles[i % otherRoles.length])
        },
        content: `对${otherRoles[i % otherRoles.length]}的评论 ${i + 1}：这是一段示例评论。`,
        created_at: new Date(Date.now() - (i + 1) * 43200000).toISOString()
      }))
    }

    // 计算活跃度等级
    const calculateActivityLevel = (todayActs: number): string => {
      if (todayActs >= 10) return 'high'
      if (todayActs >= 5) return 'medium'
      return 'low'
    }

    // 根据角色信息生成标签
    const generateTagsFromRole = (role: any): string[] => {
      const tags: string[] = []
      
      // 从阵营生成标签
      if (role.role_camp) tags.push(role.role_camp)
      
      // 从身份生成标签
      if (role.role_identity) {
        const identityTags = role.role_identity.split('、').slice(0, 2)
        tags.push(...identityTags)
      }
      
      // 从性格生成标签
      if (role.role_personality) {
        const personalityTags = role.role_personality.split('、').slice(0, 2)
        tags.push(...personalityTags)
      }
      
      // 确保至少有5个标签
      while (tags.length < 5) {
        tags.push(['文学', '历史', '哲学', '美术', '音乐', '科技', '旅行', '饮酒', '月亮'][tags.length])
      }
      
      return tags.slice(0, 5)
    }

    // 生成模拟数据
    const generateMockData = (roleId: string): RoleData => {
      const roleNames = ['李白', '杜甫', '苏轼', '李清照', '王维', '陶渊明', '屈原', '白居易', '刘禹锡', '杜牧']
      const randomName = roleNames[parseInt(roleId) % roleNames.length]
      const randomTags = ['文学', '历史', '哲学', '美术', '音乐', '科技', '旅行', '饮酒', '月亮', '诗词']
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)

      // 生成模拟帖子
      const mockPosts = Array.from({ length: 3 }, (_, i) => ({
        id: `post-${i}`,
        content: `${randomName}的示例内容 ${i + 1}：这是一段示例文本，展示角色发布的内容。`,
        type: ['诗词', '散文', '评论'][i % 3],
        created_at: new Date(Date.now() - i * 86400000).toISOString()
      }))

      // 生成模拟评论
      const mockComments = Array.from({ length: 2 }, (_, i) => ({
        id: `comment-${i}`,
        to_role: {
          id: `${(parseInt(roleId) + i + 1) % 10}`,
          name: roleNames[(parseInt(roleId) + i + 1) % roleNames.length],
          avatar: generateAvatar(roleNames[(parseInt(roleId) + i + 1) % roleNames.length])
        },
        content: `对${roleNames[(parseInt(roleId) + i + 1) % roleNames.length]}的评论 ${i + 1}：这是一段示例评论。`,
        created_at: new Date(Date.now() - (i + 1) * 43200000).toISOString()
      }))

      // 生成模拟时间线
      const mockTimeline = Array.from({ length: 5 }, (_, i) => ({
        id: `timeline-${i}`,
        time: new Date(Date.now() - i * 3600000).toLocaleString(),
        type: ['行为', '创作', '互动', '思考', '观察'][i % 5],
        description: `${['生成行为数据', '创作内容', '与其他角色互动', '深度思考', '观察周围环境'][i % 5]}`,
        content: `${randomName}在${new Date(Date.now() - i * 3600000).toLocaleTimeString()} ${['生成了一条行为记录', '创作了一段内容', '与其他角色进行了交流', '进行了深度思考', '观察了周围的环境'][i % 5]}`
      }))

      return {
        id: roleId,
        name: randomName,
        title: '历史人物',
        description: `${randomName}是中国历史上著名的人物，以其独特的个性和成就而闻名。`,
        model: 'qwen3:0.6b',
        quota: {
          used: Math.floor(Math.random() * 200),
          remaining: Math.floor(Math.random() * 300) + 100,
          total: 500
        },
        todayActs: Math.floor(Math.random() * 15),
        activityLevel: Math.random() > 0.5 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
        tags: randomTags,
        avatar: generateAvatar(randomName),
        posts: mockPosts,
        comments: mockComments,
        timeline: mockTimeline
      }
    }

    fetchRoleData()
  }, [roleId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!roleData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-orange-50 to-red-50">
        <p className="text-gray-500">角色数据加载失败</p>
      </div>
    )
  }

  const getActivityStatus = () => {
    if (roleData.activityLevel === 'high') return '活跃'
    if (roleData.activityLevel === 'medium') return '一般'
    return '安静'
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-50 to-red-50 p-4 md:p-8">
      {/* 添加 Font Awesome */}
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      
      {/* 全局样式 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
        
        body {
          font-family: 'Noto Sans SC', sans-serif;
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.6);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px 0 rgba(252, 182, 159, 0.25);
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(251, 146, 60, 0.5);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 146, 60, 0.8);
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .tab-active {
          color: #ea580c;
          border-bottom: 2px solid #ea580c;
        }
        
        .tab-inactive {
          color: #78716c;
          border-bottom: 2px solid transparent;
        }
        
        .tab-inactive:hover {
          color: #ea580c;
        }
      `}</style>

      {/* 主容器 */}
      <div className="max-w-5xl mx-auto">
  

        {/* 面包屑 */}
        <div className="mb-6 flex items-center text-sm text-stone-500 font-medium">
          <button onClick={onBack} className="hover:text-orange-600 transition-colors flex items-center gap-1">
            <i className="fa-solid fa-arrow-left"></i> 返回角色列表
          </button>
          <span className="mx-3 text-stone-300">/</span>
          <span className="text-orange-700 flex items-center gap-1">
            <i className="fa-solid fa-id-card"></i> {roleData.name} 的角色详情
          </span>
        </div>

        {/* 角色信息卡片 */}
        <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden">
          {/* 装饰性背景 */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            {/* 角色头像 */}
            <div className="relative group mx-auto md:mx-0">
              <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform transition-transform duration-500 group-hover:scale-105">
                <img 
                  src={roleData.avatar} 
                  alt={roleData.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-white p-2 rounded-full shadow-lg">
                <span className="flex h-4 w-4 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
              </div>
            </div>

            {/* 角色信息 */}
            <div className="flex-1 w-full">
              <div className="flex flex-col justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-stone-800 mb-1">{roleData.name}</h2>
                  <p className="text-orange-600 font-medium text-lg">{roleData.title}</p>
                </div>
              </div>

              {/* 角色描述和标签 */}
              <div className="mb-6">
                <p className="text-stone-600 italic mb-3 border-l-4 border-orange-300 pl-3 bg-orange-50/50 py-1 rounded-r">
                  "{roleData.description}"
                </p>
                <div className="flex flex-wrap gap-2">
                  {roleData.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 模型信息 */}
                <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm">
                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">当前模型</div>
                  <div className="font-mono text-sm font-bold text-stone-800 flex items-center gap-2">
                    <i className="fa-solid fa-microchip text-orange-500"></i>
                    {roleData.model}
                  </div>
                </div>

                {/* 额度信息 */}
                <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm">
                  <div className="flex justify-between text-xs text-stone-500 uppercase tracking-wider mb-1">
                    <span>Token 额度</span>
                    <span className="font-bold text-orange-600">{roleData.quota.used}/{roleData.quota.total}</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2.5 mb-1">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-red-500 h-2.5 rounded-full" 
                      style={{ width: `${(roleData.quota.used / roleData.quota.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-right text-stone-400">
                    {roleData.quota.remaining < 100 ? '即将耗尽' : '充足'}
                  </div>
                </div>

                {/* 活跃度信息 */}
                <div className="bg-white/60 rounded-xl p-4 border border-white shadow-sm">
                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">活跃度状态</div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                    <span className="font-bold text-stone-800">{getActivityStatus()}</span>
                    <span className="text-xs text-stone-400 ml-auto">今日行为: {roleData.todayActs}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 内容标签页 */}
        <div className="glass-card rounded-3xl min-h-[400px] flex flex-col">
          {/* 标签页导航 */}
          <div className="border-b border-orange-100 px-6 pt-2">
            <nav className="flex gap-8" aria-label="Tabs">
              <button 
                className={`py-4 px-1 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'posts' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('posts')}
              >
                <i className="fa-solid fa-book-open"></i> 作品 <span className="bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs">{roleData.posts.length}</span>
              </button>
              <button 
                className={`py-4 px-1 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'comments' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('comments')}
              >
                <i className="fa-regular fa-comments"></i> 评论
              </button>
              <button 
                className={`py-4 px-1 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'timeline' ? 'tab-active' : 'tab-inactive'}`}
                onClick={() => setActiveTab('timeline')}
              >
                <i className="fa-solid fa-clock-rotate-left"></i> 动态
              </button>
            </nav>
          </div>

          {/* 标签页内容 */}
          <div className="p-6 flex-1 bg-white/40">
            {/* 作品内容 */}
            {activeTab === 'posts' && (
              <div className="space-y-4 animate-fade-in">
                {roleData.posts.length > 0 ? (
                  roleData.posts.map((post) => (
                    <div key={post.id} className="group bg-white p-4 rounded-xl border border-orange-50 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                          <i className="fa-solid fa-pen-nib"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-800 group-hover:text-orange-600 transition-colors">{post.type}</h4>
                          <p className="text-sm text-stone-500">{post.content}</p>
                        </div>
                      </div>
                      <div className="text-xs text-stone-400 font-mono">{new Date(post.created_at).toLocaleString('zh-CN')}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-300 text-3xl">
                      <i className="fa-regular fa-folder-open"></i>
                    </div>
                    <h3 className="text-lg font-medium text-stone-600">还没有作品</h3>
                    <p className="text-stone-400 text-sm">该角色尚未生成任何内容</p>
                  </div>
                )}
              </div>
            )}

            {/* 评论内容 */}
            {activeTab === 'comments' && (
              <div className="space-y-6">
                {roleData.comments.length > 0 ? (
                  roleData.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-orange-100">
                        <img 
                          src={comment.to_role.avatar} 
                          alt={comment.to_role.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800">对 {comment.to_role.name} 的评论</h4>
                          <span className="text-sm text-gray-400">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-300 text-3xl animate-bounce">
                      <i className="fa-regular fa-comments"></i>
                    </div>
                    <h3 className="text-lg font-medium text-stone-600">暂无评论</h3>
                    <p className="text-stone-400 text-sm">成为第一个评论的人吧</p>
                  </div>
                )}
              </div>
            )}

            {/* 动态内容 */}
            {activeTab === 'timeline' && (
              <div className="space-y-6 pl-4 border-l-2 border-orange-200 ml-2">
                {roleData.timeline.length > 0 ? (
                  roleData.timeline.map((event, index) => (
                    <div key={event.id || index} className="relative">
                      <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-orange-400 border-4 border-white shadow-sm"></div>
                      <div className="mb-1 text-sm text-stone-500 font-mono">{event.time}</div>
                      
                      {/* 优化对话显示为微信形式 */}
                      {event.type === '互动' && event.content && event.content.includes(':') ? (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-2xl">
                          {event.content.split('\n').map((line, lineIndex) => {
                            if (line.trim()) {
                              const [speaker, message] = line.split(':', 2);
                              const isCurrentRole = speaker === roleData.name;
                              return (
                                <div key={lineIndex} className={`flex ${isCurrentRole ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                                  {!isCurrentRole && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                      <span className="text-gray-600 text-xs">{speaker[0]}</span>
                                    </div>
                                  )}
                                  <div className={`max-w-[80%] ${isCurrentRole ? 'bg-primary-100 text-gray-800 rounded-2xl rounded-tr-none' : 'bg-white text-gray-800 rounded-2xl rounded-tl-none shadow-sm'} p-3 border ${isCurrentRole ? 'border-primary-200' : 'border-gray-200'}`}>
                                    <div className={`font-medium text-sm mb-1 ${isCurrentRole ? 'text-primary-600' : 'text-gray-600'}`}>
                                      {speaker}
                                    </div>
                                    <div className="text-sm leading-relaxed">
                                      {message?.trim() || ''}
                                    </div>
                                  </div>
                                  {isCurrentRole && (
                                    <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center flex-shrink-0">
                                      <span className="text-primary-600 text-xs">{speaker[0]}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : (
                        <div className="bg-white p-3 rounded-lg shadow-sm border border-orange-50 inline-block">
                          <span className="text-stone-700">{event.description}: {event.content || '暂无内容'}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-300 text-3xl">
                      <i className="fa-solid fa-clock-rotate-left"></i>
                    </div>
                    <h3 className="text-lg font-medium text-stone-600">暂无动态</h3>
                    <p className="text-stone-400 text-sm">该角色尚未生成任何动态</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleDetailPage