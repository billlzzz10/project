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
  Wand2, 
  Copy, 
  Edit, 
  Trash2, 
  Save, 
  FileText, 
  Star,
  Search,
  Filter
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

export default function PromptGenerator() {
  const [prompts, setPrompts] = useState([])
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')
  
  // Form states
  const [promptForm, setPromptForm] = useState({
    name: '',
    description: '',
    template: '',
    category: 'general',
    tags: [],
    is_public: false
  })
  
  // Generator states
  const [generatorForm, setGeneratorForm] = useState({
    task_description: '',
    examples: []
  })
  
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    try {
      const response = await fetch(`${API_BASE}/prompts?user_id=1`)
      const data = await response.json()
      setPrompts(data)
    } catch (error) {
      console.error('Error loading prompts:', error)
    }
  }

  const generatePrompt = async () => {
    if (!generatorForm.task_description.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE}/prompts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatorForm)
      })
      
      const data = await response.json()
      if (data.generated_prompt) {
        setGeneratedPrompt(data.generated_prompt)
        setPromptForm(prev => ({
          ...prev,
          template: data.generated_prompt,
          name: `Generated: ${generatorForm.task_description.substring(0, 30)}...`
        }))
      }
    } catch (error) {
      console.error('Error generating prompt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const savePrompt = async () => {
    if (!promptForm.name.trim() || !promptForm.template.trim()) return
    
    try {
      const response = await fetch(`${API_BASE}/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...promptForm,
          user_id: 1
        })
      })
      
      if (response.ok) {
        const newPrompt = await response.json()
        setPrompts([newPrompt, ...prompts])
        setPromptForm({
          name: '',
          description: '',
          template: '',
          category: 'general',
          tags: [],
          is_public: false
        })
        setActiveTab('browse')
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
    }
  }

  const deletePrompt = async (promptId) => {
    try {
      const response = await fetch(`${API_BASE}/prompts/${promptId}?user_id=1`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setPrompts(prompts.filter(p => p.id !== promptId))
        if (selectedPrompt?.id === promptId) {
          setSelectedPrompt(null)
        }
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(prompts.map(p => p.category))]

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prompt Generator</h1>
          <p className="text-gray-600">สร้างและจัดการ Prompt Templates</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">เรียกดู Prompts</TabsTrigger>
          <TabsTrigger value="generate">สร้าง Prompt</TabsTrigger>
          <TabsTrigger value="create">สร้างด้วยตนเอง</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="ค้นหา Prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
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
            {/* Prompts List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Prompt Templates ({filteredPrompts.length})</h3>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredPrompts.map((prompt) => (
                    <Card
                      key={prompt.id}
                      className={`cursor-pointer transition-colors ${
                        selectedPrompt?.id === prompt.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPrompt(prompt)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{prompt.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{prompt.category}</Badge>
                              {prompt.is_public && <Badge variant="default">Public</Badge>}
                              <span className="text-xs text-gray-500">ใช้งาน {prompt.usage_count} ครั้ง</span>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(prompt.template)
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                deletePrompt(prompt.id)
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

            {/* Prompt Detail */}
            <div>
              {selectedPrompt ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {selectedPrompt.name}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedPrompt.template)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          คัดลอก
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">คำอธิบาย</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedPrompt.description}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Template</label>
                      <Textarea
                        value={selectedPrompt.template}
                        readOnly
                        className="mt-1 h-40"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{selectedPrompt.category}</Badge>
                      {selectedPrompt.is_public && <Badge variant="default">Public</Badge>}
                      <span className="text-sm text-gray-500">
                        สร้างเมื่อ {new Date(selectedPrompt.created_at).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">เลือก Prompt เพื่อดูรายละเอียด</p>
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
                <Wand2 className="w-5 h-5 mr-2" />
                สร้าง Prompt อัตโนมัติ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">อธิบายงานที่ต้องการ</label>
                <Textarea
                  placeholder="เช่น: สร้าง prompt สำหรับเขียนบทความเกี่ยวกับเทคโนโลยี AI"
                  value={generatorForm.task_description}
                  onChange={(e) => setGeneratorForm(prev => ({
                    ...prev,
                    task_description: e.target.value
                  }))}
                  className="mt-1"
                />
              </div>
              
              <Button 
                onClick={generatePrompt} 
                disabled={isLoading || !generatorForm.task_description.trim()}
                className="w-full"
              >
                {isLoading ? 'กำลังสร้าง...' : 'สร้าง Prompt'}
              </Button>
              
              {generatedPrompt && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Prompt ที่สร้างขึ้น</label>
                  <Textarea
                    value={generatedPrompt}
                    onChange={(e) => setGeneratedPrompt(e.target.value)}
                    className="mt-1 h-40"
                  />
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(generatedPrompt)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      คัดลอก
                    </Button>
                    <Button
                      onClick={() => {
                        setPromptForm(prev => ({
                          ...prev,
                          template: generatedPrompt
                        }))
                        setActiveTab('create')
                      }}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      บันทึกเป็น Template
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
                สร้าง Prompt Template ใหม่
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">ชื่อ Template</label>
                  <Input
                    placeholder="ชื่อ Prompt Template"
                    value={promptForm.name}
                    onChange={(e) => setPromptForm(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">หมวดหมู่</label>
                  <select
                    value={promptForm.category}
                    onChange={(e) => setPromptForm(prev => ({
                      ...prev,
                      category: e.target.value
                    }))}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="general">ทั่วไป</option>
                    <option value="writing">การเขียน</option>
                    <option value="analysis">การวิเคราะห์</option>
                    <option value="creative">สร้างสรรค์</option>
                    <option value="business">ธุรกิจ</option>
                    <option value="technical">เทคนิค</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">คำอธิบาย</label>
                <Textarea
                  placeholder="อธิบายการใช้งาน Prompt นี้"
                  value={promptForm.description}
                  onChange={(e) => setPromptForm(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Template</label>
                <Textarea
                  placeholder="เขียน Prompt Template ของคุณที่นี่..."
                  value={promptForm.template}
                  onChange={(e) => setPromptForm(prev => ({
                    ...prev,
                    template: e.target.value
                  }))}
                  className="mt-1 h-40"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={promptForm.is_public}
                  onChange={(e) => setPromptForm(prev => ({
                    ...prev,
                    is_public: e.target.checked
                  }))}
                />
                <label htmlFor="is_public" className="text-sm text-gray-700">
                  แชร์เป็น Public Template
                </label>
              </div>
              
              <Button 
                onClick={savePrompt}
                disabled={!promptForm.name.trim() || !promptForm.template.trim()}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                บันทึก Template
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

