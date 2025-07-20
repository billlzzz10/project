import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Zap, 
  Copy, 
  Edit, 
  Trash2, 
  Save, 
  Code, 
  Play,
  Search,
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react'

const API_BASE = 'http://localhost:5000/api'

export default function ToolGenerator() {
  const [tools, setTools] = useState([])
  const [selectedTool, setSelectedTool] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  
  // Form states
  const [toolForm, setToolForm] = useState({
    name: '',
    description: '',
    code: '',
    language: 'python',
    category: 'general',
    is_tested: false
  })
  
  // Generator states
  const [generatorForm, setGeneratorForm] = useState({
    tool_description: '',
    language: 'python'
  })
  
  const [generatedCode, setGeneratedCode] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      const response = await fetch(`${API_BASE}/tools?user_id=1`)
      const data = await response.json()
      setTools(data)
    } catch (error) {
      console.error('Error loading tools:', error)
    }
  }

  const generateTool = async () => {
    if (!generatorForm.tool_description.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/tools/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatorForm)
      })
      
      const data = await response.json()
      if (data.generated_code) {
        setGeneratedCode(data.generated_code)
        setToolForm(prev => ({
          ...prev,
          code: data.generated_code,
          language: generatorForm.language,
          name: `Generated: ${generatorForm.tool_description.substring(0, 30)}...`,
          description: generatorForm.tool_description
        }))
      }
    } catch (error) {
      console.error('Error generating tool:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveTool = async () => {
    if (!toolForm.name.trim() || !toolForm.code.trim()) return
    
    try {
      const response = await fetch(`${API_BASE}/tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...toolForm,
          user_id: 1
        })
      })
      
      if (response.ok) {
        const newTool = await response.json()
        setTools([newTool, ...tools])
        setToolForm({
          name: '',
          description: '',
          code: '',
          language: 'python',
          category: 'general',
          is_tested: false
        })
        setActiveTab('browse')
      }
    } catch (error) {
      console.error('Error saving tool:', error)
    }
  }

  const deleteTool = async (toolId) => {
    try {
      const response = await fetch(`${API_BASE}/tools/${toolId}?user_id=1`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTools(tools.filter(t => t.id !== toolId))
        if (selectedTool?.id === toolId) {
          setSelectedTool(null)
        }
      }
    } catch (error) {
      console.error('Error deleting tool:', error)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const downloadCode = (code, filename) => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = selectedLanguage === 'all' || tool.language === selectedLanguage
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesLanguage && matchesCategory
  })

  const languages = [...new Set(tools.map(t => t.language))]
  const categories = [...new Set(tools.map(t => t.category))]

  const getLanguageIcon = (language) => {
    switch (language) {
      case 'python': return '🐍'
      case 'javascript': return '🟨'
      case 'java': return '☕'
      case 'cpp': return '⚡'
      case 'go': return '🐹'
      default: return '💻'
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tool Generator</h1>
          <p className="text-gray-600">สร้างและจัดการ Code Tools อัตโนมัติ</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">เรียกดู Tools</TabsTrigger>
          <TabsTrigger value="generate">สร้าง Tool</TabsTrigger>
          <TabsTrigger value="create">สร้างด้วยตนเอง</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="ค้นหา Tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">ทุกภาษา</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tools List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Generated Tools ({filteredTools.length})</h3>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredTools.map((tool) => (
                    <Card
                      key={tool.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTool?.id === tool.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedTool(tool)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getLanguageIcon(tool.language)}</span>
                              <h4 className="font-medium text-gray-900">{tool.name}</h4>
                              {tool.is_tested ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{tool.language}</Badge>
                              <Badge variant="outline">{tool.category}</Badge>
                              <span className="text-xs text-gray-500">ใช้งาน {tool.usage_count} ครั้ง</span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(tool.code)
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                downloadCode(tool.code, `${tool.name}.${tool.language === 'python' ? 'py' : 'js'}`)
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteTool(tool.id)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Tool Detail */}
            <div>
              {selectedTool ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getLanguageIcon(selectedTool.language)}</span>
                        {selectedTool.name}
                        {selectedTool.is_tested ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedTool.code)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          คัดลอก
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadCode(
                            selectedTool.code, 
                            `${selectedTool.name}.${selectedTool.language === 'python' ? 'py' : 'js'}`
                          )}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          ดาวน์โหลด
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">คำอธิบาย</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedTool.description}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Code</label>
                      <Textarea
                        value={selectedTool.code}
                        readOnly
                        className="mt-1 h-80 font-mono text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{selectedTool.language}</Badge>
                      <Badge variant="outline">{selectedTool.category}</Badge>
                      <span className="text-sm text-gray-500">
                        สร้างเมื่อ {new Date(selectedTool.created_at).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">เลือก Tool เพื่อดูรายละเอียด</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                สร้าง Tool อัตโนมัติ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">อธิบาย Tool ที่ต้องการ</label>
                <Textarea
                  placeholder="เช่น: สร้างฟังก์ชันสำหรับแปลงไฟล์ CSV เป็น JSON"
                  value={generatorForm.tool_description}
                  onChange={(e) => setGeneratorForm(prev => ({
                    ...prev,
                    tool_description: e.target.value
                  }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">ภาษาโปรแกรม</label>
                <select
                  value={generatorForm.language}
                  onChange={(e) => setGeneratorForm(prev => ({
                    ...prev,
                    language: e.target.value
                  }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                </select>
              </div>
              
              <Button 
                onClick={generateTool} 
                disabled={isLoading || !generatorForm.tool_description.trim()}
                className="w-full"
              >
                {isLoading ? 'กำลังสร้าง...' : 'สร้าง Tool'}
              </Button>
              
              {generatedCode && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Code ที่สร้างขึ้น</label>
                  <Textarea
                    value={generatedCode}
                    onChange={(e) => setGeneratedCode(e.target.value)}
                    className="mt-1 h-80 font-mono text-sm"
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(generatedCode)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      คัดลอก
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => downloadCode(
                        generatedCode, 
                        `generated_tool.${generatorForm.language === 'python' ? 'py' : 'js'}`
                      )}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      ดาวน์โหลด
                    </Button>
                    <Button
                      onClick={() => {
                        setToolForm(prev => ({
                          ...prev,
                          code: generatedCode
                        }))
                        setActiveTab('create')
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      บันทึกเป็น Tool
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                สร้าง Tool ใหม่
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">ชื่อ Tool</label>
                  <Input
                    placeholder="ชื่อ Tool"
                    value={toolForm.name}
                    onChange={(e) => setToolForm(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">ภาษาโปรแกรม</label>
                  <select
                    value={toolForm.language}
                    onChange={(e) => setToolForm(prev => ({
                      ...prev,
                      language: e.target.value
                    }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">หมวดหมู่</label>
                <select
                  value={toolForm.category}
                  onChange={(e) => setToolForm(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="general">ทั่วไป</option>
                  <option value="data">ข้อมูล</option>
                  <option value="web">เว็บ</option>
                  <option value="automation">อัตโนมัติ</option>
                  <option value="utility">เครื่องมือ</option>
                  <option value="api">API</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">คำอธิบาย</label>
                <Textarea
                  placeholder="อธิบายการใช้งาน Tool นี้"
                  value={toolForm.description}
                  onChange={(e) => setToolForm(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Code</label>
                <Textarea
                  placeholder="เขียน Code ของคุณที่นี่..."
                  value={toolForm.code}
                  onChange={(e) => setToolForm(prev => ({
                    ...prev,
                    code: e.target.value
                  }))}
                  className="mt-1 h-80 font-mono text-sm"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_tested"
                  checked={toolForm.is_tested}
                  onChange={(e) => setToolForm(prev => ({
                    ...prev,
                    is_tested: e.target.checked
                  }))}
                />
                <label htmlFor="is_tested" className="text-sm text-gray-700">
                  ทดสอบแล้ว
                </label>
              </div>
              
              <Button 
                onClick={saveTool}
                disabled={!toolForm.name.trim() || !toolForm.code.trim()}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                บันทึก Tool
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

