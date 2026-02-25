import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, MessageCircle, Calendar, Tag, Activity, Clock } from 'lucide-react'

interface BehaviorDetailPageProps {
  actId: string
  onBack: () => void
}

interface Behavior {
  act_id: string
  role_id: number
  act_date: string
  act_time: string
  act_type: 'self_act' | 'dialog_act'
  act_tag: string
  output_type: string
  security_check_result: string
}

interface SelfActDetail {
  act_id: string
  self_act_content: string
  output_content: string
  llm_model: string
}

interface Dialog {
  dialog_id: string
  act_id: string
  speaker_role_id: number
  speaker_name: string
  dialog_content: string
  dialog_round: number
}

interface BehaviorDetail {
  act: Behavior
  detail?: SelfActDetail
  dialogs?: Dialog[]
}

const BehaviorDetailPage: React.FC<BehaviorDetailPageProps> = ({ actId, onBack }) => {
  const [behaviorDetail, setBehaviorDetail] = useState<BehaviorDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleNames, setRoleNames] = useState<Record<number, string>>({})
  const [recommendedContents, setRecommendedContents] = useState<Array<{id: string, content: string, type: string, created_at: string, role_id: number}>>([])

  useEffect(() => {
    const fetchBehaviorDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        // 获取行为详情
        const response = await fetch(`http://localhost:8002/api/behaviors/${actId}/details`)
        if (!response.ok) {
          throw new Error('获取行为详情失败')
        }
        const data = await response.json()
        setBehaviorDetail(data)

        // 获取角色信息
        const rolesResponse = await fetch('http://localhost:8002/api/roles')
        if (rolesResponse.ok) {
          const roles = await rolesResponse.json()
          const names: Record<number, string> = {}
          roles.forEach((role: any) => {
            names[role.role_id] = role.role_name
          })
          setRoleNames(names)
        }

        // 获取推荐的历史产出内容
        try {
          const { act, dialogs } = data
          const isSelfAct = act.act_type === 'self_act'
          
          const behaviorsResponse = await fetch('http://localhost:8002/api/behaviors')
          if (behaviorsResponse.ok) {
            const behaviors = await behaviorsResponse.json()
            
            if (isSelfAct) {
              // 自主行为：获取该角色的其他历史产出
              const roleBehaviors = behaviors
                .filter((b: any) => b.role_id === act.role_id && b.act_id !== parseInt(actId))
                .sort((a: any, b: any) => new Date(b.act_time).getTime() - new Date(a.act_time).getTime())
                .slice(0, 5)
              
              // 获取行为详情
              const recommended = await Promise.all(
                roleBehaviors.map(async (b: any) => {
                  try {
                    const detailsRes = await fetch(`http://localhost:8002/api/behaviors/${b.act_id}/details`)
                    const detailsData = await detailsRes.json()
                    let content = '暂无内容'
                    if (b.act_type === 'self_act' && detailsData.detail) {
                      content = detailsData.detail.self_act_content || '暂无内容'
                    } else if (b.act_type === 'dialog_act' && detailsData.dialogs) {
                      content = detailsData.dialogs.map((dialog: any) => `${dialog.speaker_name}: ${dialog.dialog_content}`).join('\n')
                    }
                    return {
                      id: b.act_id.toString(),
                      content: content,
                      type: b.act_tag || '行为',
                      created_at: b.act_time || new Date().toISOString(),
                      role_id: b.role_id
                    }
                  } catch {
                    return {
                      id: b.act_id.toString(),
                      content: '暂无内容',
                      type: b.act_tag || '行为',
                      created_at: b.act_time || new Date().toISOString(),
                      role_id: b.role_id
                    }
                  }
                })
              )
              setRecommendedContents(recommended)
            } else if (dialogs && dialogs.length > 0) {
              // 对话行为：获取参与对话的两个角色的历史产出
              const speakerRoleIds = [...new Set(dialogs.map((d: any) => d.speaker_role_id))]
              const dialogBehaviors = behaviors
                .filter((b: any) => speakerRoleIds.includes(b.role_id) && b.act_id !== parseInt(actId))
                .sort((a: any, b: any) => new Date(b.act_time).getTime() - new Date(a.act_time).getTime())
                .slice(0, 5)
              
              // 获取行为详情
              const recommended = await Promise.all(
                dialogBehaviors.map(async (b: any) => {
                  try {
                    const detailsRes = await fetch(`http://localhost:8002/api/behaviors/${b.act_id}/details`)
                    const detailsData = await detailsRes.json()
                    let content = '暂无内容'
                    if (b.act_type === 'self_act' && detailsData.detail) {
                      content = detailsData.detail.self_act_content || '暂无内容'
                    } else if (b.act_type === 'dialog_act' && detailsData.dialogs) {
                      content = detailsData.dialogs.map((dialog: any) => `${dialog.speaker_name}: ${dialog.dialog_content}`).join('\n')
                    }
                    return {
                      id: b.act_id.toString(),
                      content: content,
                      type: b.act_tag || '行为',
                      created_at: b.act_time || new Date().toISOString(),
                      role_id: b.role_id
                    }
                  } catch {
                    return {
                      id: b.act_id.toString(),
                      content: '暂无内容',
                      type: b.act_tag || '行为',
                      created_at: b.act_time || new Date().toISOString(),
                      role_id: b.role_id
                    }
                  }
                })
              )
              setRecommendedContents(recommended)
            }
          }
        } catch (err) {
          console.error('获取推荐内容失败:', err)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
        console.error('获取行为详情失败:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBehaviorDetail()
  }, [actId])

  const getRoleName = (roleId: number) => {
    return roleNames[roleId] || `角色${roleId}`
  }

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) {
        // 尝试其他格式
        const parts = timeStr.split(' ')
        if (parts.length === 2) {
          return timeStr
        }
        return timeStr
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return timeStr
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error || !behaviorDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || '行为详情不存在'}</p>
        <button
          onClick={onBack}
          className="flex items-center justify-center mx-auto px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </button>
      </div>
    )
  }

  const { act, detail, dialogs } = behaviorDetail
  const isSelfAct = act.act_type === 'self_act'

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回行为列表
          </button>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isSelfAct ? 'bg-primary-50 text-primary-600' : 'bg-green-50 text-green-600'}`}>
              {isSelfAct ? '自主行为' : '交互行为'}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              {act.act_tag}
            </span>
          </div>
        </div>
      </div>

      {/* 行为基本信息 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isSelfAct ? '自主行为详情' : '交互行为详情'}
            </h2>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>{act.act_date}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{act.act_time}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">行为角色</h3>
                <p className="text-gray-800">{getRoleName(act.role_id)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Tag className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">行为标签</h3>
                <p className="text-gray-800">{act.act_tag}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Activity className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">产出类型</h3>
                <p className="text-gray-800">{act.output_type || '无'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Tag className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">安全检查</h3>
                <p className={`font-medium ${act.security_check_result === 'passed' ? 'text-green-600' : 'text-red-600'}`}>
                  {act.security_check_result === 'passed' ? '通过' : '未通过'}
                </p>
              </div>
            </div>

            {isSelfAct && detail && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Tag className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">AI模型</h3>
                  <p className="text-gray-800">{detail.llm_model}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 行为内容 */}
      {isSelfAct ? (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 shadow-lg border border-primary-200">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-500" />
              行为描述
            </h3>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 leading-relaxed">
                {detail?.self_act_content || '无描述'}
              </p>
            </div>
          </div>

          {detail?.output_content && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-primary-500" />
                产出内容
              </h3>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <span className="text-sm font-medium text-gray-600">{act.output_type}</span>
                </div>
                <div className="p-4">
                  <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm leading-relaxed">
                    {detail.output_content}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg border border-green-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
            对话内容
          </h3>
          <div className="space-y-4">
            {dialogs?.map((dialog) => (
              <div key={dialog.dialog_id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-gray-800">{dialog.speaker_name}</span>
                  <span className="text-xs text-gray-400">第{dialog.dialog_round}轮</span>
                </div>
                <div className="ml-6">
                  <p className="text-gray-700 leading-relaxed">
                    {dialog.dialog_content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 推荐历史产出内容 */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {isSelfAct ? '推荐该角色历史产出内容' : '推荐参与对话角色的历史产出内容'}
        </h3>
        
        {recommendedContents.length > 0 ? (
          <div className="space-y-4">
            {recommendedContents.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      {item.type}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getRoleName(item.role_id)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatTime(item.created_at)}
                  </div>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {item.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-300 flex items-center justify-center">
              <Tag className="w-8 h-8" />
            </div>
            <p>暂无推荐内容</p>
            <p className="text-sm mt-1">系统会自动生成更多内容</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BehaviorDetailPage