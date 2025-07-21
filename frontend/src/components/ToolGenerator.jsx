import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardHeader, Button,
  TextField, TextareaAutosize, Badge, Tabs, Tab, CircularProgress,
  IconButton, Select, MenuItem, FormControl, InputLabel, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BoltIcon from '@mui/icons-material/Bolt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';

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
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const response = await fetch(`${API_BASE}/tools?user_id=1`)
      const data = await response.json()
      setTools(data)
    } catch (error) {
      console.error('Error loading tools:', error)
    }
  };

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
  };

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
  };

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
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadCode = (code, filename) => {
    const element = document.createElement('a')
    const file = new Blob([code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLanguage = selectedLanguage === 'all' || tool.language === selectedLanguage
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesLanguage && matchesCategory
  });

  const languages = [...new Set(tools.map(t => t.language))];
  const categories = [...new Set(tools.map(t => t.category))];

  const getLanguageIcon = (language) => {
    switch (language) {
      case 'python': return '🐍'
      case 'javascript': return '🟨'
      case 'java': return '☕'
      case 'cpp': return '⚡'
      case 'go': return '🐹'
      default: return <CodeIcon />;
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Tool Generator</Typography>
          <Typography color="text.secondary">สร้างและจัดการ Code Tools อัตโนมัติ</Typography>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="เรียกดู Tools" value="browse" />
        <Tab label="สร้าง Tool" value="generate" />
        <Tab label="สร้างด้วยตนเอง" value="create" />
      </Tabs>

      {activeTab === 'browse' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="ค้นหา Tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon />,
                }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>ภาษา</InputLabel>
                <Select value={selectedLanguage} label="ภาษา" onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <MenuItem value="all">ทุกภาษา</MenuItem>
                  {languages.map(lang => (
                    <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>หมวดหมู่</InputLabel>
                <Select value={selectedCategory} label="หมวดหมู่" onChange={(e) => setSelectedCategory(e.target.value)}>
                  <MenuItem value="all">ทุกหมวดหมู่</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Generated Tools ({filteredTools.length})</Typography>
            <Paper sx={{ height: '70vh', overflow: 'auto' }}>
              <Box p={2}>
                {filteredTools.map((tool) => (
                  <Card
                    key={tool.id}
                    sx={{ mb: 2, cursor: 'pointer', border: selectedTool?.id === tool.id ? '2px solid' : '1px solid', borderColor: selectedTool?.id === tool.id ? 'primary.main' : 'divider' }}
                    onClick={() => setSelectedTool(tool)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6" component="div" display="flex" alignItems="center" gap={1}>
                            {getLanguageIcon(tool.language)} {tool.name}
                            {tool.is_tested ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="error" fontSize="small" />}
                          </Typography>
                          <Typography color="text.secondary" sx={{ mb: 1 }}>{tool.description}</Typography>
                          <Chip label={tool.language} size="small" sx={{ mr: 1 }} />
                          <Chip label={tool.category} size="small" />
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); copyToClipboard(tool.code); }}><ContentCopyIcon /></IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); downloadCode(tool.code, `${tool.name}.${tool.language === 'python' ? 'py' : 'js'}`); }}><DownloadIcon /></IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); deleteTool(tool.id); }}><DeleteIcon /></IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            {selectedTool ? (
              <Card sx={{ height: 'calc(70vh + 48px)' }}>
                <CardHeader title={selectedTool.name} subheader={selectedTool.description} />
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Code</Typography>
                  <TextareaAutosize
                    value={selectedTool.code}
                    readOnly
                    style={{ width: '100%', minHeight: '40vh', fontFamily: 'monospace', fontSize: '0.875rem', border: '1px solid #ccc', padding: '8px' }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Paper sx={{ height: 'calc(70vh + 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <CodeIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
                <Typography color="text.secondary">เลือก Tool เพื่อดูรายละเอียด</Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {activeTab === 'generate' && (
        <Card>
          <CardHeader title={<Box display="flex" alignItems="center" gap={1}><BoltIcon /> สร้าง Tool อัตโนมัติ</Box>} />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="อธิบาย Tool ที่ต้องการ"
              placeholder="เช่น: สร้างฟังก์ชันสำหรับแปลงไฟล์ CSV เป็น JSON"
              value={generatorForm.tool_description}
              onChange={(e) => setGeneratorForm(prev => ({ ...prev, tool_description: e.target.value }))}
              multiline
              rows={4}
            />
            <FormControl fullWidth>
              <InputLabel>ภาษาโปรแกรม</InputLabel>
              <Select value={generatorForm.language} label="ภาษาโปรแกรม" onChange={(e) => setGeneratorForm(prev => ({ ...prev, language: e.target.value }))}>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
              </Select>
            </FormControl>
            <Button onClick={generateTool} variant="contained" disabled={isLoading || !generatorForm.tool_description.trim()}>
              {isLoading ? <CircularProgress size={24} /> : 'สร้าง Tool'}
            </Button>
            {generatedCode && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Code ที่สร้างขึ้น</Typography>
                <TextareaAutosize
                  value={generatedCode}
                  onChange={(e) => setGeneratedCode(e.target.value)}
                  style={{ width: '100%', minHeight: '30vh', fontFamily: 'monospace', fontSize: '0.875rem', border: '1px solid #ccc', padding: '8px' }}
                />
                <Box mt={2} display="flex" gap={1}>
                  <Button variant="outlined" onClick={() => copyToClipboard(generatedCode)}><ContentCopyIcon /> คัดลอก</Button>
                  <Button variant="outlined" onClick={() => downloadCode(generatedCode, `generated_tool.${generatorForm.language === 'python' ? 'py' : 'js'}`)}><DownloadIcon /> ดาวน์โหลด</Button>
                  <Button variant="contained" onClick={() => { setToolForm(prev => ({ ...prev, code: generatedCode })); setActiveTab('create'); }}><SaveIcon /> บันทึกเป็น Tool</Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'create' && (
        <Card>
          <CardHeader title={<Box display="flex" alignItems="center" gap={1}><AddIcon /> สร้าง Tool ใหม่</Box>} />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="ชื่อ Tool" value={toolForm.name} onChange={(e) => setToolForm(prev => ({ ...prev, name: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>ภาษาโปรแกรม</InputLabel>
              <Select value={toolForm.language} label="ภาษาโปรแกรม" onChange={(e) => setToolForm(prev => ({ ...prev, language: e.target.value }))}>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>หมวดหมู่</InputLabel>
              <Select value={toolForm.category} label="หมวดหมู่" onChange={(e) => setToolForm(prev => ({ ...prev, category: e.target.value }))}>
                <MenuItem value="general">ทั่วไป</MenuItem>
                <MenuItem value="data">ข้อมูล</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="คำอธิบาย" value={toolForm.description} onChange={(e) => setToolForm(prev => ({ ...prev, description: e.target.value }))} multiline rows={3} />
            <TextareaAutosize
              placeholder="เขียน Code ของคุณที่นี่..."
              value={toolForm.code}
              onChange={(e) => setToolForm(prev => ({ ...prev, code: e.target.value }))}
              style={{ width: '100%', minHeight: '30vh', fontFamily: 'monospace', fontSize: '0.875rem', border: '1px solid #ccc', padding: '8px' }}
            />
            <Button onClick={saveTool} variant="contained" disabled={!toolForm.name.trim() || !toolForm.code.trim()}><SaveIcon /> บันทึก Tool</Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

