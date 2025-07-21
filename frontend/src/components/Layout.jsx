import { useState } from 'react'
import { Button } from '@mui/material'
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText, 
  Zap, 
  Settings, 
  Menu,
  X,
  Brain,
  Database
} from 'lucide-react'

export default function Layout({ children, currentPage, onPageChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'แดชบอร์ด', icon: LayoutDashboard, page: 'dashboard' },
    { name: 'แชท', icon: MessageSquare, page: 'chat' },
    { name: 'Prompt Generator', icon: FileText, page: 'prompt' },
    { name: 'Tool Generator', icon: Zap, page: 'tool' },
    { name: 'RAG Management', icon: Database, page: 'rag' },
    { name: 'การตั้งค่า', icon: Settings, page: 'settings' }
  ]

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Business
              </h1>
              <p className="text-xs text-gray-500">Advanced AI Platform</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.page}
                  variant={currentPage === item.page ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    currentPage === item.page 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onPageChange(item.page)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">ระบบออนไลน์</span>
            </div>
            <p className="text-xs text-gray-600">
              AI Models พร้อมใช้งาน
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">
              {navigation.find(item => item.page === currentPage)?.name || 'AI Business App'}
            </h2>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

