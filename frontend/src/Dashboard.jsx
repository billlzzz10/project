import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  MessageSquare, 
  Database, 
  Brain, 
  Zap, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings,
  Activity,
  Clock
} from 'lucide-react'

const API_BASE = 'http://localhost:5000/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalChats: 0,
    totalMessages: 0,
    ragDocuments: 0,
    promptTemplates: 0,
    generatedTools: 0,
    systemHealth: 95
  })
  
  const [ragStats, setRagStats] = useState({
    total_documents: 0,
    index_size: 0,
    embeddings_dimension: 0
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load RAG stats
      const ragResponse = await fetch(`${API_BASE}/chat/rag/stats`)
      if (ragResponse.ok) {
        const ragData = await ragResponse.json()
        setRagStats(ragData)
      }

      // Load chat sessions
      const sessionsResponse = await fetch(`${API_BASE}/chat/sessions?user_id=1`)
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        const totalMessages = sessionsData.reduce((sum, session) => sum + session.message_count, 0)
        
        setStats(prev => ({
          ...prev,
          totalChats: sessionsData.length,
          totalMessages: totalMessages,
          ragDocuments: ragData.total_documents
        }))
      }

      // Simulate recent activity
      setRecentActivity([
        { id: 1, type: 'chat', message: 'สร้างแชทใหม่', time: '5 นาทีที่แล้ว' },
        { id: 2, type: 'rag', message: 'เพิ่มเอกสารใหม่ในระบบ RAG', time: '15 นาทีที่แล้ว' },
        { id: 3, type: 'prompt', message: 'สร้าง Prompt Template ใหม่', time: '1 ชั่วโมงที่แล้ว' },
        { id: 4, type: 'tool', message: 'สร้าง Tool อัตโนมัติ', time: '2 ชั่วโมงที่แล้ว' }
      ])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const chartData = [
    { name: 'จันทร์', messages: 24, chats: 4 },
    { name: 'อังคาร', messages: 35, chats: 6 },
    { name: 'พุธ', messages: 28, chats: 5 },
    { name: 'พฤหัส', messages: 42, chats: 7 },
    { name: 'ศุกร์', messages: 38, chats: 6 },
    { name: 'เสาร์', messages: 31, chats: 5 },
    { name: 'อาทิตย์', messages: 29, chats: 4 }
  ]

  const pieData = [
    { name: 'แชทธรรมดา', value: 60, color: '#3B82F6' },
    { name: 'RAG Chat', value: 30, color: '#10B981' },
    { name: 'Prompt Generation', value: 10, color: '#F59E0B' }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-4 h-4" />
      case 'rag': return <Database className="w-4 h-4" />
      case 'prompt': return <FileText className="w-4 h-4" />
      case 'tool': return <Zap className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
          <p className="text-gray-600">ภาพรวมระบบ AI Business App</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          รีเฟรช
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">แชททั้งหมด</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChats}</div>
            <p className="text-xs text-muted-foreground">
              +12% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ข้อความทั้งหมด</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              +8% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เอกสาร RAG</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ragStats.total_documents}</div>
            <p className="text-xs text-muted-foreground">
              ขนาด Index: {ragStats.index_size}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สุขภาพระบบ</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemHealth}%</div>
            <Progress value={stats.systemHealth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>สถิติการใช้งานรายวัน</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#3B82F6" name="ข้อความ" />
                <Bar dataKey="chats" fill="#10B981" name="แชท" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>การกระจายการใช้งาน</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>กิจกรรมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถานะระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Google Gemini API</span>
                <Badge variant="default">เชื่อมต่อแล้ว</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hugging Face</span>
                <Badge variant="default">เชื่อมต่อแล้ว</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RAG System</span>
                <Badge variant="default">ทำงานปกติ</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <Badge variant="default">ทำงานปกติ</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">n8n Integration</span>
                <Badge variant="secondary">ยังไม่เชื่อมต่อ</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

