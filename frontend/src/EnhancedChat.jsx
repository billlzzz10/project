import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Save as SaveIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Mock data for chat sessions
const mockSessions = [
  { id: 1, title: 'วิเคราะห์ข้อมูลการขาย', created_at: '2025-07-18T10:30:00Z', last_message: 'ขอบคุณสำหรับการวิเคราะห์' },
  { id: 2, title: 'แผนการตลาดปี 2025', created_at: '2025-07-17T14:20:00Z', last_message: 'ฉันจะสร้างแผนการตลาดให้' },
  { id: 3, title: 'ข้อมูลลูกค้า', created_at: '2025-07-16T09:15:00Z', last_message: 'นี่คือรายงานข้อมูลลูกค้า' }
];

// Mock data for chat messages
const mockMessages = [
  { id: 1, session_id: 1, sender: 'user', content: 'ช่วยวิเคราะห์ข้อมูลการขายในไตรมาสที่ 2 ปี 2025 ให้หน่อย', created_at: '2025-07-18T10:25:00Z' },
  { id: 2, session_id: 1, sender: 'assistant', content: 'จากข้อมูลการขายในไตรมาสที่ 2 ปี 2025 พบว่ามียอดขายเพิ่มขึ้น 15% เมื่อเทียบกับไตรมาสเดียวกันของปีที่แล้ว สินค้าที่ขายดีที่สุดคือ Product A ซึ่งมียอดขายเพิ่มขึ้น 25% ตามด้วย Product B ที่เพิ่มขึ้น 18%\n\nกลุ่มลูกค้าหลักยังคงเป็นกลุ่มอายุ 25-34 ปี ซึ่งมีสัดส่วนการซื้อสูงถึง 45% ของยอดขายทั้งหมด\n\nช่องทางการขายออนไลน์มีการเติบโตสูงสุดที่ 30% ในขณะที่ช่องทางหน้าร้านเพิ่มขึ้นเพียง 5%', created_at: '2025-07-18T10:26:00Z' },
  { id: 3, session_id: 1, sender: 'user', content: 'ขอบคุณสำหรับการวิเคราะห์ ช่วยสรุปเป็นข้อๆ ให้หน่อยได้ไหม', created_at: '2025-07-18T10:28:00Z' },
  { id: 4, session_id: 1, sender: 'assistant', content: 'สรุปข้อมูลการขายไตรมาสที่ 2 ปี 2025:\n\n1. ยอดขายรวมเพิ่มขึ้น 15% เมื่อเทียบกับไตรมาสเดียวกันของปีที่แล้ว\n2. Product A เป็นสินค้าขายดีที่สุด (เพิ่มขึ้น 25%)\n3. Product B เป็นสินค้าขายดีอันดับ 2 (เพิ่มขึ้น 18%)\n4. กลุ่มลูกค้าหลักคือช่วงอายุ 25-34 ปี (45% ของยอดขายทั้งหมด)\n5. ช่องทางออนไลน์เติบโต 30%\n6. ช่องทางหน้าร้านเติบโต 5%', created_at: '2025-07-18T10:29:00Z' },
  { id: 5, session_id: 1, sender: 'user', content: 'ขอบคุณมาก', created_at: '2025-07-18T10:30:00Z' }
];

// Mock API functions
const mockCreateSession = (title) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newSession = {
        id: Math.floor(Math.random() * 1000),
        title: title || 'แชทใหม่',
        created_at: new Date().toISOString(),
        last_message: ''
      };
      resolve(newSession);
    }, 500);
  });
};

const mockGetSessions = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockSessions);
    }, 300);
  });
};

const mockGetMessages = (sessionId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filteredMessages = mockMessages.filter(msg => msg.session_id === sessionId);
      resolve(filteredMessages);
    }, 300);
  });
};

const mockSendMessage = (sessionId, content) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userMessage = {
        id: Math.floor(Math.random() * 1000),
        session_id: sessionId,
        sender: 'user',
        content: content,
        created_at: new Date().toISOString()
      };
      
      // Simulate AI response
      const aiMessage = {
        id: Math.floor(Math.random() * 1000),
        session_id: sessionId,
        sender: 'assistant',
        content: `ฉันได้รับข้อความของคุณแล้ว: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
        created_at: new Date(Date.now() + 1000).toISOString()
      };
      
      resolve([userMessage, aiMessage]);
    }, 1000);
  });
};

const mockDeleteSession = (sessionId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

const mockUploadFile = (file, sessionId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 1000),
        filename: file.name,
        file_type: file.name.split('.').pop(),
        file_size: file.size,
        created_at: new Date().toISOString(),
        processed: true
      });
    }, 1500);
  });
};

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function EnhancedChat() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [newSessionDialog, setNewSessionDialog] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [streaming, setStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSessions = async () => {
    setSessionLoading(true);
    try {
      const response = await mockGetSessions();
      setSessions(response);
      if (response.length > 0 && !currentSession) {
        setCurrentSession(response[0]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      showSnackbar('ไม่สามารถโหลดแชทได้', 'error');
    } finally {
      setSessionLoading(false);
    }
  };

  const loadMessages = async (sessionId) => {
    setMessageLoading(true);
    try {
      const response = await mockGetMessages(sessionId);
      setMessages(response);
    } catch (error) {
      console.error('Error loading messages:', error);
      showSnackbar('ไม่สามารถโหลดข้อความได้', 'error');
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentSession) return;

    const content = newMessage;
    setNewMessage('');
    
    // Add user message immediately
    const tempUserMessage = {
      id: 'temp-' + Date.now(),
      session_id: currentSession.id,
      sender: 'user',
      content: content,
      created_at: new Date().toISOString()
    };
    setMessages([...messages, tempUserMessage]);
    
    // Simulate streaming response
    setStreaming(true);
    setStreamedResponse('');
    
    try {
      // In a real app, this would be a streaming API call
      const response = await mockSendMessage(currentSession.id, content);
      
      // Simulate streaming by adding characters one by one
      const aiResponse = response[1].content;
      for (let i = 0; i < aiResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        setStreamedResponse(aiResponse.substring(0, i + 1));
      }
      
      // After streaming completes, add the messages to the state
      setMessages([...messages, response[0], response[1]]);
      
      // Update session's last message
      const updatedSessions = sessions.map(session => {
        if (session.id === currentSession.id) {
          return { ...session, last_message: content };
        }
        return session;
      });
      setSessions(updatedSessions);
      
    } catch (error) {
      console.error('Error sending message:', error);
      showSnackbar('ไม่สามารถส่งข้อความได้', 'error');
    } finally {
      setStreaming(false);
      setStreamedResponse('');
    }
  };

  const handleCreateSession = async () => {
    setNewSessionDialog(false);
    setLoading(true);
    
    try {
      const newSession = await mockCreateSession(newSessionTitle);
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setNewSessionTitle('');
      showSnackbar('สร้างแชทใหม่สำเร็จ', 'success');
    } catch (error) {
      console.error('Error creating session:', error);
      showSnackbar('ไม่สามารถสร้างแชทใหม่ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!currentSession) return;
    
    setDeleteDialog(false);
    setLoading(true);
    
    try {
      await mockDeleteSession(currentSession.id);
      const updatedSessions = sessions.filter(session => session.id !== currentSession.id);
      setSessions(updatedSessions);
      setCurrentSession(updatedSessions.length > 0 ? updatedSessions[0] : null);
      setMessages([]);
      showSnackbar('ลบแชทสำเร็จ', 'success');
    } catch (error) {
      console.error('Error deleting session:', error);
      showSnackbar('ไม่สามารถลบแชทได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    if (!currentSession) return;
    
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      await mockUploadFile(file, currentSession.id);
      
      // Add system message about file upload
      const fileMessage = {
        id: 'file-' + Date.now(),
        session_id: currentSession.id,
        sender: 'system',
        content: `ไฟล์ "${file.name}" ถูกอัปโหลดและกำลังประมวลผล`,
        created_at: new Date().toISOString()
      };
      setMessages([...messages, fileMessage]);
      
      showSnackbar('อัปโหลดไฟล์สำเร็จ', 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('ไม่สามารถอัปโหลดไฟล์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCopyMessages = () => {
    const text = messages
      .map(msg => `${msg.sender === 'user' ? 'คุณ' : 'AI'}: ${msg.content}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(text);
    showSnackbar('คัดลอกข้อความแล้ว', 'success');
    handleMenuClose();
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          แชท
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewSessionDialog(true)}
          disabled={loading}
        >
          สร้างแชทใหม่
        </Button>
      </Box>

      {/* Chat Interface */}
      <Grid container spacing={2}>
        {/* Sessions List */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}>
            {sessionLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : sessions.length === 0 ? (
              <Box p={3} textAlign="center">
                <Typography color="text.secondary">
                  ยังไม่มีแชท กดปุ่ม "สร้างแชทใหม่" เพื่อเริ่มต้น
                </Typography>
              </Box>
            ) : (
              <List>
                {sessions.map((session) => (
                  <ListItem
                    key={session.id}
                    button
                    selected={currentSession?.id === session.id}
                    onClick={() => setCurrentSession(session)}
                    sx={{
                      borderLeft: currentSession?.id === session.id ? 3 : 0,
                      borderColor: 'primary.main',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={session.title}
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {session.last_message || 'ยังไม่มีข้อความ'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Chat Messages */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            {currentSession && (
              <Box
                p={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={1}
                borderColor="divider"
              >
                <Typography variant="h6">{currentSession.title}</Typography>
                <Box>
                  <IconButton
                    component="label"
                    disabled={loading}
                  >
                    <AttachFileIcon />
                    <input
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                      accept=".pdf,.html,.csv,.docx,.doc,.md,.txt,.xlsx,.xls,.pptx,.ppt"
                    />
                  </IconButton>
                  <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={handleCopyMessages}>
                      <CopyIcon fontSize="small" sx={{ mr: 1 }} />
                      คัดลอกข้อความทั้งหมด
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); setDeleteDialog(true); }}>
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                      ลบแชทนี้
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); }}>
                      <SaveIcon fontSize="small" sx={{ mr: 1 }} />
                      บันทึกเป็นเอกสาร
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>
            )}

            {/* Messages Area */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                backgroundColor: '#f5f5f5',
              }}
            >
              {!currentSession ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <Typography color="text.secondary">
                    เลือกแชทหรือสร้างแชทใหม่เพื่อเริ่มต้นสนทนา
                  </Typography>
                </Box>
              ) : messageLoading ? (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="100%"
                >
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                        mb: 2,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: message.sender === 'user' ? 'primary.main' : 
                                    message.sender === 'assistant' ? 'secondary.main' : 'grey.500',
                          }}
                        >
                          {message.sender === 'user' ? <PersonIcon /> : 
                           message.sender === 'assistant' ? <BotIcon /> : <RefreshIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          ml: message.sender === 'user' ? 1 : 0,
                          mr: message.sender === 'user' ? 0 : 1,
                          backgroundColor: message.sender === 'user' ? 'primary.light' : 
                                          message.sender === 'assistant' ? 'white' : 'grey.100',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {message.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 1, textAlign: 'right' }}
                        >
                          {formatDate(message.created_at)}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}

                  {/* Streaming message */}
                  {streaming && (
                    <Box
                      sx={{
                        display: 'flex',
                        mb: 2,
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <BotIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          mr: 1,
                          backgroundColor: 'white',
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {streamedResponse || <CircularProgress size={20} />}
                        </Typography>
                      </Paper>
                    </Box>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Input Area */}
            {currentSession && (
              <Box
                p={2}
                borderTop={1}
                borderColor="divider"
                sx={{ backgroundColor: 'white' }}
              >
                <Box display="flex">
                  <TextField
                    fullWidth
                    placeholder="พิมพ์ข้อความ..."
                    variant="outlined"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={streaming}
                    multiline
                    maxRows={4}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || streaming}
                    sx={{ ml: 1, alignSelf: 'flex-end' }}
                  >
                    ส่ง
                  </Button>
                </Box>
                <Box mt={1}>
                  <Chip
                    label="อัปโหลดไฟล์"
                    icon={<AttachFileIcon />}
                    component="label"
                    clickable
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <input
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                      accept=".pdf,.html,.csv,.docx,.doc,.md,.txt,.xlsx,.xls,.pptx,.ppt"
                    />
                  </Chip>
                  <Chip
                    label="ใช้ RAG"
                    icon={<RefreshIcon />}
                    clickable
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Session Dialog */}
      <Dialog
        open={newSessionDialog}
        onClose={() => setNewSessionDialog(false)}
      >
        <DialogTitle>สร้างแชทใหม่</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="ชื่อแชท"
            fullWidth
            variant="outlined"
            value={newSessionTitle}
            onChange={(e) => setNewSessionTitle(e.target.value)}
            placeholder="เช่น วิเคราะห์ข้อมูลการขาย"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewSessionDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleCreateSession}
            variant="contained"
            disabled={loading}
          >
            สร้าง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>ยืนยันการลบแชท</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            คุณกำลังจะลบแชท "{currentSession?.title}" และข้อความทั้งหมด
          </Alert>
          <Typography>
            การดำเนินการนี้ไม่สามารถย้อนกลับได้ คุณต้องการดำเนินการต่อหรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleDeleteSession}
            color="error"
            variant="contained"
          >
            ลบแชท
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EnhancedChat;

