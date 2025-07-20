import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, MessageSquare, Plus } from 'lucide-react'

const API_BASE = 'http://localhost:5000/api'

export default function Chat() {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useRAG, setUseRAG] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id)
    }
  }, [currentSession])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/sessions?user_id=1`)
      const data = await response.json()
      setSessions(data)
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0])
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const loadMessages = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/chat/sessions/${sessionId}/messages`)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const createNewSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,
          title: 'New Chat'
        })
      })
      const newSession = await response.json()
      setSessions([newSession, ...sessions])
      setCurrentSession(newSession)
      setMessages([])
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || isLoading) return

    setIsLoading(true)
    const messageText = inputMessage
    setInputMessage('')

    try {
      const response = await fetch(`${API_BASE}/chat/sessions/${currentSession.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          use_rag: useRAG
        })
      })
      
      const data = await response.json()
      
      if (data.user_message && data.ai_response) {
        setMessages(prev => [...prev, data.user_message, data.ai_response])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button onClick={createNewSession} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            สร้างแชทใหม่
          </Button>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-colors ${
                  currentSession?.id === session.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => setCurrentSession(session)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.title}</p>
                      <p className="text-xs text-gray-500">
                        {session.message_count} ข้อความ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{currentSession.title}</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant={useRAG ? "default" : "secondary"}>
                    {useRAG ? 'RAG เปิด' : 'RAG ปิด'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUseRAG(!useRAG)}
                  >
                    {useRAG ? 'ปิด RAG' : 'เปิด RAG'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.role === 'assistant' && (
                          <Bot className="w-5 h-5 text-blue-500 mt-0.5" />
                        )}
                        {message.role === 'user' && (
                          <User className="w-5 h-5 text-white mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${
                              message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTimestamp(message.timestamp)}
                            </span>
                            {message.confidence_score && (
                              <Badge variant="outline" className="text-xs">
                                ความมั่นใจ: {(message.confidence_score * 100).toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-5 h-5 text-blue-500" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="พิมพ์ข้อความของคุณ..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">เลือกแชทหรือสร้างใหม่</h3>
              <p className="text-gray-500">เริ่มต้นการสนทนากับ AI ของคุณ</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

