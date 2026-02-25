import { useState } from 'react'
import { Users, Zap, Brain, Menu, X } from 'lucide-react'
import OverviewPage from './pages/OverviewPage'
import RolesPage from './pages/RolesPage'
import BehaviorsPage from './pages/BehaviorsPage'
import BehaviorDetailPage from './pages/BehaviorDetailPage'
import RoleDetailPage from './pages/RoleDetailPage'

type PageType = 'overview' | 'roles' | 'behaviors' | 'detail' | 'roleDetail'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('overview')
  const [selectedActId, setSelectedActId] = useState<string>('')
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'overview' as PageType, label: '概览', icon: Zap },
    { id: 'roles' as PageType, label: '角色', icon: Users },
    { id: 'behaviors' as PageType, label: '行为', icon: Brain },
  ]

  const handleViewBehaviorDetail = (actId: string) => {
    setSelectedActId(actId)
    setCurrentPage('detail')
  }

  const handleBackFromDetail = () => {
    setCurrentPage('behaviors')
  }

  const handleViewRoleDetail = (roleId: string) => {
    setSelectedRoleId(roleId)
    setCurrentPage('roleDetail')
  }

  const handleBackFromRoleDetail = () => {
    setCurrentPage('roles')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />
      case 'roles':
        return <RolesPage onViewDetail={handleViewRoleDetail} />
      case 'behaviors':
        return <BehaviorsPage onViewDetail={handleViewBehaviorDetail} />
      case 'detail':
        return <BehaviorDetailPage actId={selectedActId} onBack={handleBackFromDetail} />
      case 'roleDetail':
        return <RoleDetailPage roleId={selectedRoleId} onBack={handleBackFromRoleDetail} />
      default:
        return <OverviewPage />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200">
      {/* 顶部导航 */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                🎭 AI角色行为生成系统
              </h1>
            </div>
            
            {/* 桌面端导航 */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      currentPage === item.id
                        ? 'text-primary-500 border-b-2 border-primary-500'
                        : 'text-gray-600 hover:text-primary-500'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            {/* 移动端菜单按钮 */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-primary-500"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`block w-full text-left px-4 py-3 text-sm font-medium ${
                    currentPage === item.id
                      ? 'text-primary-500 bg-primary-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>

      {/* 底部 */}
      <footer className="bg-white/80 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            高拟真AI角色自主行为生成系统 · 第一阶段 · v1.0.0
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
