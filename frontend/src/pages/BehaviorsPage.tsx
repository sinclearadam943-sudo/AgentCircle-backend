import React, { useEffect, useState } from 'react'
import { Play, RefreshCw, Clock, MessageCircle, User, FileText, Eye } from 'lucide-react'
import { mockBehaviors, mockRoles } from '../mockData'

interface Behavior {
  act_id: number
  role_id: number
  act_date: string
  act_type: string
  target_role_id: number | null
  act_time: string
  act_tag: string
  output_type: string
}

interface Role {
  role_id: number
  role_name: string
}

interface BehaviorsPageProps {
  onViewDetail?: (actId: string) => void
}

const BehaviorsPage: React.FC<BehaviorsPageProps> = ({ onViewDetail }) => {
  const [behaviors, setBehaviors] = useState<Behavior[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string>('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 使用模拟数据
      setBehaviors(mockBehaviors)
      setRoles(mockRoles)
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateBehaviors = async () => {
    setGenerating(true)
    try {
      const roleId = selectedRole ? parseInt(selectedRole) : undefined
      await axios.post('/api/behaviors/generate', { role_id: roleId })
      fetchData()
      alert('行为生成成功！')
    } catch (error) {
      console.error('生成行为失败:', error)
      alert('生成行为失败')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateTimelines = async () => {
    try {
      await axios.post('/api/timeline/generate-all')
      alert('时间线生成成功！')
    } catch (error) {
      console.error('生成时间线失败:', error)
      alert('生成时间线失败')
    }
  }

  const getRoleName = (roleId: number) => {
    return roles.find(r => r.role_id === roleId)?.role_name || '未知'
  }

  const formatTime = (timeStr: string) => {
    // 处理各种时间格式
    let date: Date
    
    if (!timeStr) {
      return '未知时间'
    }
    
    // 尝试直接解析
    date = new Date(timeStr)
    
    // 如果解析失败（Invalid Date），尝试替换格式
    if (isNaN(date.getTime())) {
      // 处理 "2025/2/6 10:30:00" 格式
      const parts = timeStr.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})[\s,]+(\d{1,2}):(\d{2}):?(\d{2})?/)
      if (parts) {
        const [, year, month, day, hour, minute, second = '0'] = parts
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second))
      }
    }
    
    // 如果还是无效，返回原始字符串
    if (isNaN(date.getTime())) {
      return timeStr
    }
    
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewDetail = (actId: number) => {
    if (onViewDetail) {
      onViewDetail(actId.toString())
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">行为记录</h2>
          <p className="text-sm text-gray-500">角色行为历史记录</p>
        </div>
      </div>

      {/* 主内容区 - 两列布局 */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* 左侧：行为列表 */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">行为记录</h3>
            </div>
            
            <div className="divide-y divide-gray-100">
              {behaviors.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无行为记录</p>
                  <p className="text-sm mt-1">系统会自动生成行为</p>
                </div>
              ) : (
                behaviors.map((behavior) => (
                  <div key={behavior.act_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            behavior.act_type === 'self_act'
                              ? 'bg-primary-50 text-primary-600'
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {behavior.act_type === 'self_act' ? '自主行为' : '交互行为'}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {behavior.act_tag}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTime(behavior.act_time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-800">
                            {getRoleName(behavior.role_id)}
                          </span>
                          
                          {behavior.act_type === 'dialog_act' && behavior.target_role_id && (
                            <>
                              <MessageCircle className="w-4 h-4 text-gray-400 mx-1" />
                              <span className="text-gray-600">
                                与 {getRoleName(behavior.target_role_id)} 对话
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewDetail(behavior.act_id)}
                        className="flex items-center px-3 py-1 border border-primary-300 text-primary-600 rounded-lg hover:bg-primary-50 transition-all text-sm"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        查看详情
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右侧：Top排名列表 */}
        <div className="w-full lg:w-80">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">角色行为排名（累计）</h3>
            </div>
            
            <div className="p-4">
              {roles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无角色数据</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roles
                    .map(role => {
                      // 计算每个角色的行为次数
                      const actCount = behaviors.filter(b => b.role_id === role.role_id).length
                      return { ...role, actCount }
                    })
                    .sort((a, b) => b.actCount - a.actCount)
                    .slice(0, 10)
                    .map((role, index) => (
                      <div key={role.role_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-100 text-yellow-600' :
                            index === 1 ? 'bg-gray-100 text-gray-600' :
                            index === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{role.role_name}</div>
                            <div className="text-xs text-gray-500">{role.actCount} 次行为</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          #{index + 1}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 border border-primary-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">使用说明</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></span>
            <span><strong>自主行为：</strong>角色独立进行的行为，如赋诗、练剑、编程等</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></span>
            <span><strong>交互行为：</strong>两个角色之间的对话交流，生成3轮对话</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></span>
            <span><strong>定时任务：</strong>系统每10分钟自动为随机角色生成一个行为</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default BehaviorsPage
