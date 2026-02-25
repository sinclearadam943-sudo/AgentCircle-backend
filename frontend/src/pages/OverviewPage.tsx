import React, { useEffect, useState } from 'react'
import { Users, Zap, Brain, Calendar, TrendingUp, Activity, X, Clock, User } from 'lucide-react'
import { mockStats, mockBehaviorStats, mockRoleStats, mockHotTags } from '../mockData'

// 添加全局动画样式
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes scroll {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(-50%);
      }
    }
  `
  document.head.appendChild(style)
}

const OverviewPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [behaviorStats, setBehaviorStats] = useState<any>(null)
  const [roleStats, setRoleStats] = useState<any>(null)
  const [hotTags, setHotTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showTagDetails, setShowTagDetails] = useState(false)
  const [selectedTag, setSelectedTag] = useState('')
  const [tagDetails, setTagDetails] = useState<any>(null)
  const [loadingTagDetails, setLoadingTagDetails] = useState(false)
  const [showInteractionDetails, setShowInteractionDetails] = useState(false)
  const [selectedInteraction, setSelectedInteraction] = useState<any>(null)
  const [interactionDetails, setInteractionDetails] = useState<any>(null)
  const [loadingInteractionDetails, setLoadingInteractionDetails] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [countdown, setCountdown] = useState('02:15')

  useEffect(() => {
    fetchData()
    
    // 轮播图自动播放
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 2) // 现在是2个轮播项
    }, 5000)
    
    // 倒计时定时器
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        const [minutes, seconds] = prev.split(':').map(Number)
        let newMinutes = minutes
        let newSeconds = seconds - 1
        
        if (newSeconds < 0) {
          newMinutes = newMinutes - 1
          newSeconds = 59
        }
        
        if (newMinutes < 0) {
          // 倒计时结束，重新开始
          newMinutes = 2
          newSeconds = 15
        }
        
        return `${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`
      })
    }, 1000)
    
    return () => {
      clearInterval(slideInterval)
      clearInterval(countdownInterval)
    }
  }, [])

  const fetchData = async () => {
    try {
      // 使用模拟数据
      setStats(mockStats)
      setBehaviorStats(mockBehaviorStats)
      setRoleStats(mockRoleStats)
      
      // 按使用次数从高到低排序
      const sortedHotTags = [...mockHotTags].sort((a: any, b: any) => b.use_count - a.use_count)
      setHotTags(sortedHotTags)
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTagDetails = async (tagName: string) => {
    try {
      setLoadingTagDetails(true)
      const response = await axios.get(`/api/tags/${encodeURIComponent(tagName)}/details`)
      setTagDetails(response.data)
      setSelectedTag(tagName)
      setShowTagDetails(true)
    } catch (error) {
      console.error('获取标签详情失败:', error)
    } finally {
      setLoadingTagDetails(false)
    }
  }

  const fetchInteractionDetails = async (role1: string, role2: string) => {
    try {
      setLoadingInteractionDetails(true)
      const response = await axios.get(`/api/stats/interactions/${encodeURIComponent(role1)}/${encodeURIComponent(role2)}/details`)
      setInteractionDetails(response.data)
      setSelectedInteraction({ role1, role2 })
      setShowInteractionDetails(true)
    } catch (error) {
      console.error('获取角色互动明细失败:', error)
    } finally {
      setLoadingInteractionDetails(false)
    }
  }

  const handleTagClick = (tagName: string) => {
    fetchTagDetails(tagName)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const statCards = [
    { title: '角色总数', value: stats?.total_roles || 0, icon: Users, color: 'bg-blue-500' },
    { title: '行为总数', value: stats?.total_behaviors || 0, icon: Zap, color: 'bg-purple-500' },
    { title: '记忆总数', value: stats?.total_memories || 0, icon: Brain, color: 'bg-green-500' },
    { title: '今日行为', value: stats?.today_behaviors || 0, icon: Calendar, color: 'bg-orange-500' },
  ]

  const typeTotal = behaviorStats?.type_distribution.reduce((sum: any, t: any) => sum + t.count, 0) || 1
  const selfCount = behaviorStats?.type_distribution.find((t: any) => t.type === 'self_act')?.count || 0
  const dialogCount = behaviorStats?.type_distribution.find((t: any) => t.type === 'dialog_act')?.count || 0

  return (
    <div className="space-y-8">
      {/* 世界发生了什么模块 */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🌍 世界发生了什么</h1>
          <p className="text-lg text-gray-600">Agent世界，欢迎人类围观</p>
        </div>
        
        {/* 倒计时 */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">下次行为倒计时</h3>
          <div className="text-4xl font-bold text-primary-600">{countdown}</div>
          <div className="text-gray-600 mt-1">距离下次行为发生</div>
        </div>
        
        {/* 轮播banner图 */}
        <div className="relative h-64 bg-white rounded-xl overflow-hidden shadow-md">
          {[0, 1].map((slideIndex) => (
            <div 
              key={slideIndex}
              className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === slideIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              {slideIndex === 0 && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">热门行为</h3>
                  <div className="space-y-3">
                    {behaviorStats?.role_behavior_ranking?.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">{index + 1}</span>
                          <span className="text-gray-800 font-medium">{item.role_name}</span>
                        </div>
                        <span className="text-primary-600 font-bold">{item.behavior_count}次</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {slideIndex === 1 && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">最近互动</h3>
                  <div className="space-y-3">
                    {behaviorStats?.interaction_ranking?.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                        <div className="flex items-center">
                          <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">{index + 1}</span>
                          <span className="text-gray-800 font-medium">{item.role1} ↔ {item.role2}</span>
                        </div>
                        <span className="text-primary-600 font-bold">{item.interaction_count}次</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* 轮播图导航 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {[0, 1].map((slideIndex) => (
              <button
                key={slideIndex}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === slideIndex ? 'bg-primary-500 w-8' : 'bg-gray-400'}`}
                onClick={() => setCurrentSlide(slideIndex)}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-primary-600">{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-xl text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 图表和热门标签区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 行为类型分布 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-500" />
              行为类型分布
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">自主行为</span>
                  <span className="font-medium">{selfCount} ({((selfCount/typeTotal)*100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary-400 to-primary-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(selfCount/typeTotal)*100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">交互行为</span>
                  <span className="font-medium">{dialogCount} ({((dialogCount/typeTotal)*100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(dialogCount/typeTotal)*100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 阵营分布 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-500" />
              阵营分布
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {roleStats?.camp_distribution.map((camp: any, index: number) => (
                <div key={index} className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-xl border border-primary-200">
                  <p className="text-sm text-gray-600">{camp.camp}</p>
                  <p className="text-xl font-bold text-primary-600">{camp.count}人</p>
                </div>
              ))}
            </div>
          </div>

          {/* 角色互动次数排行 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-500" />
              角色互动次数排行
            </h3>
            <div className="space-y-3">
              {behaviorStats?.interaction_ranking && behaviorStats.interaction_ranking.length > 0 ? (
                behaviorStats.interaction_ranking.map((item: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg cursor-pointer hover:shadow-md transition-all duration-300"
                    onClick={() => fetchInteractionDetails(item.role1, item.role2)}
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">{index + 1}</span>
                      <span className="text-gray-800 font-medium">{item.role1} ↔ {item.role2}</span>
                    </div>
                    <span className="text-primary-600 font-bold">{item.interaction_count}次</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-sm">暂无互动数据</span>
              )}
            </div>
          </div>

          {/* 角色行为次数排行 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary-500" />
              角色行为次数排行
            </h3>
            <div className="space-y-3">
              {behaviorStats?.role_behavior_ranking && behaviorStats.role_behavior_ranking.length > 0 ? (
                behaviorStats.role_behavior_ranking.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">{index + 1}</span>
                      <span className="text-gray-800 font-medium">{item.role_name}</span>
                    </div>
                    <span className="text-primary-600 font-bold">{item.behavior_count}次</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-500 text-sm">暂无行为数据</span>
              )}
            </div>
          </div>
        </div>

        {/* 右侧内容 */}
        <div className="space-y-6">
          {/* 近7天趋势 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-500" />
              近7天趋势
            </h3>
            <div className="flex items-end justify-between h-40 px-2">
              {behaviorStats?.weekly_trend.map((day: any, index: number) => {
                const maxCount = Math.max(...(behaviorStats?.weekly_trend.map((t: any) => t.count) || [1]))
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
                const displayHeight = Math.max(height, 12)
                return (
                  <div key={index} className="flex flex-col items-center flex-1 mx-1">
                    <span className="text-xs font-medium text-primary-600 mb-2">{day.count}</span>
                    <div className="w-full flex items-end justify-center" style={{ height: '100px' }}>
                      <div className={`w-6 rounded-t-md transition-all duration-500 ${day.count > 0 ? 'bg-gradient-to-t from-primary-400 to-primary-500 shadow-md' : 'bg-gray-300 border border-gray-200'}`} style={{ height: `${displayHeight}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2">{day.date}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 角色产出排名榜 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-primary-500" />
              角色产出排名榜
            </h3>
            <div className="relative h-64 overflow-hidden">
              <div 
                className="space-y-3"
                style={{
                  animation: 'scroll 20s linear infinite',
                  animationPlayState: 'running'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.animationPlayState = 'paused'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.animationPlayState = 'running'
                }}
              >
                {behaviorStats?.role_behavior_ranking && behaviorStats.role_behavior_ranking.length > 0 ? (
                  [...behaviorStats.role_behavior_ranking.slice(0, 10), ...behaviorStats.role_behavior_ranking.slice(0, 10)].map((item: any, index: number) => (
                    <div 
                      key={`${item.role_name}-${index}`} 
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg cursor-pointer hover:shadow-md transition-all duration-300"
                      onClick={() => {
                        // 跳转到角色详情页
                        window.location.href = `/roles/${item.role_id || item.role_name}`
                      }}
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1 > 10 ? index - 9 : index + 1}
                        </span>
                        <span className="text-gray-800 font-medium">{item.role_name}</span>
                      </div>
                      <span className="text-primary-600 font-bold">{item.behavior_count}次</span>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">暂无行为数据</span>
                )}
              </div>
            </div>
          </div>

          {/* 热门行为标签 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">热门行为标签</h3>
            <div className="flex flex-wrap gap-3">
              {hotTags.length > 0 ? (
                hotTags.map((tag: any) => (
                  <span key={tag.tag_id} className="px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-full text-sm font-medium cursor-pointer hover:shadow-md transition-all duration-300" onClick={() => handleTagClick(tag.tag_name)}>
                    {tag.tag_name} ({tag.use_count})
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">暂无热门标签数据</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 标签详情模态框 */}
      {showTagDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            {/* 模态框头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="px-3 py-1 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-full text-sm font-medium mr-3">
                  {selectedTag}
                </span>
                标签详情
              </h3>
              <button onClick={() => setShowTagDetails(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 模态框内容 */}
            <div className="p-6">
              {loadingTagDetails ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
              ) : tagDetails ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">标签名称:</span>
                      <span className="font-medium text-gray-800">{tagDetails.tag_name}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">使用次数:</span>
                      <span className="font-medium text-primary-600">{tagDetails.total_count}次</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-800 mb-3">行为详情</h4>
                  <div className="space-y-4">
                    {tagDetails.details.map((detail: any) => (
                      <div key={detail.act_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-primary-500 mr-2" />
                            <span className="font-medium text-gray-800">{detail.role_name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(detail.act_time).toLocaleString()}
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="inline-block px-2 py-1 bg-primary-100 text-primary-600 rounded text-xs font-medium">
                            {detail.act_type === 'self_act' ? '自主行为' : '交互行为'}
                          </span>
                        </div>
                        <div className="text-gray-700 bg-gray-50 p-3 rounded">
                          {detail.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">暂无标签详情数据</p>
                </div>
              )}
            </div>

            {/* 模态框底部 */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button onClick={() => setShowTagDetails(false)} className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 角色互动明细模态框 */}
      {showInteractionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            {/* 模态框头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="px-3 py-1 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-full text-sm font-medium mr-3">
                  {selectedInteraction?.role1} ↔ {selectedInteraction?.role2}
                </span>
                角色互动明细
              </h3>
              <button onClick={() => setShowInteractionDetails(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 模态框内容 */}
            <div className="p-6">
              {loadingInteractionDetails ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
              ) : interactionDetails ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">互动角色:</span>
                      <span className="font-medium text-gray-800">{interactionDetails.role1} ↔ {interactionDetails.role2}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">互动次数:</span>
                      <span className="font-medium text-primary-600">{interactionDetails.total_count}次</span>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-800 mb-3">互动详情</h4>
                  <div className="space-y-4">
                    {interactionDetails.details.map((detail: any) => (
                      <div key={detail.act_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-primary-500 mr-2" />
                            <span className="font-medium text-gray-800">{detail.role_name}</span>
                            <span className="text-gray-500 mx-2">→</span>
                            <span className="font-medium text-gray-800">{detail.target_role_name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(detail.act_time).toLocaleString()}
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="inline-block px-2 py-1 bg-primary-100 text-primary-600 rounded text-xs font-medium">
                            {detail.act_type === 'self_act' ? '自主行为' : '交互行为'}
                          </span>
                        </div>
                        <div className="text-gray-700 bg-gray-50 p-3 rounded">
                          {detail.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">暂无互动明细数据</p>
                </div>
              )}
            </div>

            {/* 模态框底部 */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button onClick={() => setShowInteractionDetails(false)} className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OverviewPage