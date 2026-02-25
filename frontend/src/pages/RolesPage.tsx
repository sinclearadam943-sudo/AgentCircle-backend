import React, { useEffect, useState } from 'react'
import { Sword, Building2, Sparkles, Scroll, Plus, Trash2, Wand2, ExternalLink } from 'lucide-react'
import axios from 'axios'

interface Role {
  role_id: number
  role_name: string
  role_camp: string
  role_identity: string
  role_personality: string
  role_feature: string | null
  llm_model?: string
  daily_act_limit: number
  is_historical: number
  status: string
  remaining_quota?: number
  today_act_count?: number
}

interface RolesPageProps {
  onViewDetail: (roleId: string) => void
}

const campIcons: Record<string, React.ReactNode> = {
  '古风江湖': <Sword className="w-5 h-5" />,
  '现代都市': <Building2 className="w-5 h-5" />,
  '奇幻世界': <Sparkles className="w-5 h-5" />,
  '历史': <Scroll className="w-5 h-5" />
}

const campColors: Record<string, string> = {
  '古风江湖': 'from-orange-400 to-red-500',
  '现代都市': 'from-blue-400 to-blue-600',
  '奇幻世界': 'from-purple-400 to-purple-600',
  '历史': 'from-green-400 to-green-600'
}

const RolesPage: React.FC<RolesPageProps> = ({ onViewDetail }) => {
  const [roles, setRoles] = useState<Role[]>([])
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
  const [selectedCamp, setSelectedCamp] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRole, setNewRole] = useState({
    role_name: '',
    role_camp: '古风江湖',
    role_identity: '',
    role_personality: '',
    role_feature: '',
    daily_act_limit: 3
  })
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    if (selectedCamp === 'all') {
      setFilteredRoles(roles)
    } else {
      setFilteredRoles(roles.filter(role => role.role_camp === selectedCamp))
    }
  }, [selectedCamp, roles])

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles')
      const rolesData = response.data

      // 获取每个角色的额度信息
      const rolesWithQuota = await Promise.all(
        rolesData.map(async (role: Role) => {
          try {
            const quotaRes = await axios.get(`/api/roles/${role.role_id}/quota`)
            return { ...role, remaining_quota: quotaRes.data.remaining_quota }
          } catch {
            return { ...role, remaining_quota: 10000 }
          }
        })
      )

      setRoles(rolesWithQuota)
      setFilteredRoles(rolesWithQuota)
    } catch (error) {
      console.error('获取角色失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/roles', newRole)
      setShowCreateModal(false)
      setNewRole({
        role_name: '',
        role_camp: '古风江湖',
        role_identity: '',
        role_personality: '',
        role_feature: '',
        daily_act_limit: 3
      })
      fetchRoles()
    } catch (error) {
      console.error('创建角色失败:', error)
      alert('创建角色失败')
    }
  }

  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (!confirm(`确定要删除角色 "${roleName}" 吗？`)) return
    
    try {
      await axios.delete(`/api/roles/${roleId}`)
      fetchRoles()
    } catch (error) {
      console.error('删除角色失败:', error)
      alert('删除角色失败')
    }
  }

  // 调用本地大模型自动生成角色
  const handleAutoGenerate = async () => {
    if (!newRole.role_name.trim()) {
      alert('请先输入角色名称')
      return
    }
    
    setGenerating(true)
    try {
      const response = await axios.post('/api/roles/generate', {
        role_name: newRole.role_name,
        role_camp: newRole.role_camp
      })
      
      const generated = response.data
      setNewRole({
        ...newRole,
        role_identity: generated.role_identity || '',
        role_personality: generated.role_personality || '',
        role_feature: generated.role_feature || ''
      })
    } catch (error) {
      console.error('自动生成失败:', error)
      alert('自动生成失败，请手动填写')
    } finally {
      setGenerating(false)
    }
  }

  const camps = ['all', '历史', '古风江湖', '现代都市', '奇幻世界']

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 筛选按钮 */}
      <div className="flex flex-wrap gap-2">
        {camps.map((camp) => (
          <button
            key={camp}
            onClick={() => setSelectedCamp(camp)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCamp === camp
                ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-primary-50 border border-primary-200'
            }`}
          >
            {camp === 'all' ? '全部' : camp}
          </button>
        ))}
      </div>

      {/* 角色列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div
            key={role.role_id}
            onClick={() => onViewDetail(role.role_id.toString())}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${campColors[role.role_camp]} flex items-center justify-center text-white font-bold text-lg`}>
                  {role.role_name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    {role.role_name}
                    <ExternalLink className="w-3 h-3 text-primary-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </h3>
                  <p className="text-sm text-primary-500">{role.role_identity}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRole(role.role_id, role.role_name);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs">
                {campIcons[role.role_camp]}
                {role.role_camp}
              </span>
              {role.is_historical === 1 && (
                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs">
                  历史人物
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {role.role_personality}
            </p>

            {/* 模型信息 */}
            <div className="mb-3">
              <span className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
                🤖 {role.llm_model || 'qwen3:0.6b'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {/* 额度显示 */}
              <span className={`text-xs px-2 py-1 rounded-full ${
                (role.remaining_quota || 0) > 100
                  ? 'bg-blue-50 text-blue-600'
                  : (role.remaining_quota || 0) >= 10
                  ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-red-50 text-red-600'
              }`}>
                💰 {(role.remaining_quota || 10000).toLocaleString()}条
              </span>
              
              {/* 活跃度等级 */}
              <span className={`text-xs px-2 py-1 rounded-full ${
                (role.today_act_count || 0) >= 10
                  ? 'bg-purple-50 text-purple-600'
                  : (role.today_act_count || 0) >= 5
                  ? 'bg-green-50 text-green-600'
                  : (role.today_act_count || 0) > 0
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-gray-50 text-gray-500'
              }`}>
                {(role.today_act_count || 0) >= 10
                  ? '🔥 超活跃'
                  : (role.today_act_count || 0) >= 5
                  ? '⚡ 活跃'
                  : (role.today_act_count || 0) > 0
                  ? '💤 低活跃'
                  : '😴 休眠'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 创建角色弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">创建新角色</h2>
            
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色名称</label>
                <input
                  type="text"
                  value={newRole.role_name}
                  onChange={(e) => setNewRole({...newRole, role_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* AI自动生成按钮 */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAutoGenerate}
                  disabled={generating}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {generating ? '生成中...' : 'AI自动生成人设'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">阵营</label>
                <select
                  value={newRole.role_camp}
                  onChange={(e) => setNewRole({...newRole, role_camp: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="古风江湖">古风江湖</option>
                  <option value="现代都市">现代都市</option>
                  <option value="奇幻世界">奇幻世界</option>
                  <option value="历史">历史</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">身份</label>
                <input
                  type="text"
                  value={newRole.role_identity}
                  onChange={(e) => setNewRole({...newRole, role_identity: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">性格</label>
                <textarea
                  value={newRole.role_personality}
                  onChange={(e) => setNewRole({...newRole, role_personality: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">特征（可选）</label>
                <textarea
                  value={newRole.role_feature}
                  onChange={(e) => setNewRole({...newRole, role_feature: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">每日行为上限</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={newRole.daily_act_limit}
                  onChange={(e) => setNewRole({...newRole, daily_act_limit: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-lg hover:from-primary-500 hover:to-primary-600"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RolesPage
