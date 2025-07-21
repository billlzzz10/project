import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, CardHeader, Button,
  TextField, TextareaAutosize, Badge, Tabs, Tab, CircularProgress,
  IconButton, Select, MenuItem, FormControl, InputLabel, Chip
} from '@mui/material';
import { 
  Add as Plus, 
  AutoAwesome as Wand2, 
  ContentCopy as Copy, 
  Edit, 
  Delete as Trash2, 
  Save, 
  Description as FileText, 
  Star,
  Search,
  Filter
} from '@mui/icons-material';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001/api';

export default function PromptGenerator() {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  
  // Form states
  const [promptForm, setPromptForm] = useState({
    name: '',
    description: '',
    template: '',
    category: 'general',
    tags: [],
    is_public: false
  });
  
  // Generator states
  const [generatorForm, setGeneratorForm] = useState({
    task_description: '',
    examples: []
  });
  
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      const response = await fetch(`${API_BASE}/prompts?user_id=1`);
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  };

  const generatePrompt = async () => {
    if (!generatorForm.task_description.trim()) return
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/prompts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatorForm)
      });
      
      const data = await response.json();
      if (data.generated_prompt) {
        setGeneratedPrompt(data.generated_prompt);
        setPromptForm(prev => ({
          ...prev,
          template: data.generated_prompt,
          name: `Generated: ${generatorForm.task_description.substring(0, 30)}...`
        }));
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      });
      
      if (response.ok) {
        const newPrompt = await response.json();
        setPrompts([newPrompt, ...prompts]);
        setPromptForm({
          name: '',
          description: '',
          template: '',
          category: 'general',
          tags: [],
          is_public: false
        });
        setActiveTab('browse');
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
    }
  };

  const deletePrompt = async (promptId) => {
    try {
      const response = await fetch(`${API_BASE}/prompts/${promptId}?user_id=1`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPrompts(prompts.filter(p => p.id !== promptId));
        if (selectedPrompt?.id === promptId) {
          setSelectedPrompt(null);
        }
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(prompts.map(p => p.category))];

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Prompt Generator</Typography>
          <Typography color="text.secondary">สร้างและจัดการ Prompt Templates</Typography>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="เรียกดู Prompts" value="browse" />
        <Tab label="สร้าง Prompt" value="generate" />
        <Tab label="สร้างด้วยตนเอง" value="create" />
      </Tabs>

      {activeTab === 'browse' && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="ค้นหา Prompts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search />,
                }}
              />
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
            <Typography variant="h6" gutterBottom>Prompt Templates ({filteredPrompts.length})</Typography>
            <Paper sx={{ height: '70vh', overflow: 'auto' }}>
              <Box p={2}>
                {filteredPrompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    sx={{ mb: 2, cursor: 'pointer', border: selectedPrompt?.id === prompt.id ? '2px solid' : '1px solid', borderColor: selectedPrompt?.id === prompt.id ? 'primary.main' : 'divider' }}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Box>
                          <Typography variant="h6" component="div">{prompt.name}</Typography>
                          <Typography color="text.secondary" sx={{ mb: 1 }}>{prompt.description}</Typography>
                          <Chip label={prompt.category} size="small" sx={{ mr: 1 }} />
                          {prompt.is_public && <Chip label="Public" size="small" color="success" />}
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); copyToClipboard(prompt.template); }}><Copy /></IconButton>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); deletePrompt(prompt.id); }}><Trash2 /></IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            {selectedPrompt ? (
              <Card sx={{ height: 'calc(70vh + 48px)' }}>
                <CardHeader title={selectedPrompt.name} subheader={selectedPrompt.description} />
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Template</Typography>
                  <TextareaAutosize
                    value={selectedPrompt.template}
                    readOnly
                    style={{ width: '100%', minHeight: '40vh', fontFamily: 'monospace', fontSize: '0.875rem', border: '1px solid #ccc', padding: '8px' }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Paper sx={{ height: 'calc(70vh + 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <FileText sx={{ fontSize: 60, color: 'text.disabled' }} />
                <Typography color="text.secondary">เลือก Prompt เพื่อดูรายละเอียด</Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {activeTab === 'generate' && (
        <Card>
          <CardHeader title={<Box display="flex" alignItems="center" gap={1}><Wand2 /> สร้าง Prompt อัตโนมัติ</Box>} />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="อธิบายงานที่ต้องการ"
              placeholder="เช่น: สร้าง prompt สำหรับเขียนบทความเกี่ยวกับเทคโนโลยี AI"
              value={generatorForm.task_description}
              onChange={(e) => setGeneratorForm(prev => ({ ...prev, task_description: e.target.value }))}
              multiline
              rows={4}
            />
            <Button onClick={generatePrompt} variant="contained" disabled={isLoading || !generatorForm.task_description.trim()}>
              {isLoading ? <CircularProgress size={24} /> : 'สร้าง Prompt'}
            </Button>
            {generatedPrompt && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Prompt ที่สร้างขึ้น</Typography>
                <TextareaAutosize
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  style={{ width: '100%', minHeight: '30vh', fontFamily: 'monospace', fontSize: '0.875rem', border: '1px solid #ccc', padding: '8px' }}
                />
                <Box mt={2} display="flex" gap={1}>
                  <Button variant="outlined" onClick={() => copyToClipboard(generatedPrompt)}><Copy /> คัดลอก</Button>
                  <Button variant="contained" onClick={() => { setPromptForm(prev => ({ ...prev, template: generatedPrompt })); setActiveTab('create'); }}><Save /> บันทึกเป็น Template</Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'create' && (
        <Card>
          <CardHeader title={<Box display="flex" alignItems="center" gap={1}><Plus /> สร้าง Prompt Template ใหม่</Box>} />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="ชื่อ Template" value={promptForm.name} onChange={(e) => setPromptForm(prev => ({ ...prev, name: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>หมวดหมู่</InputLabel>
              <Select value={promptForm.category} label="หมวดหมู่" onChange={(e) => setPromptForm(prev => ({ ...prev, category: e.target.value }))}>
                <MenuItem value="general">ทั่วไป</MenuItem>
                <MenuItem value="writing">การเขียน</MenuItem>
                <MenuItem value="analysis">การวิเคราะห์</MenuItem>
                <MenuItem value="creative">สร้างสรรค์</MenuItem>
                <MenuItem value="business">ธุรกิจ</MenuItem>
                <MenuItem value="technical">เทคนิค</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="คำอธิบาย" value={promptForm.description} onChange={(e) => setPromptForm(prev => ({ ...prev, description: e.target.value }))} multiline rows={3} />
            <TextareaAutosize
              placeholder="เขียน Prompt Template ของคุณที่นี่..."
              value={promptForm.template}
              onChange={(e) => setPromptForm(prev => ({ ...prev, template: e.target.value }))}
              style={{ width: '100%', minHeight: '30vh', fontFamily: 'monospace', fontSize: '0.875rem', border: '1px solid #ccc', padding: '8px' }}
            />
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
            <Button onClick={savePrompt} variant="contained" disabled={!promptForm.name.trim() || !promptForm.template.trim()}><Save /> บันทึก Template</Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

