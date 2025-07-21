import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Divider,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Mock API functions
const mockCreateMindMap = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        board_id: 'abc123',
        title: data.title,
        description: data.description,
        elements: [
          {
            id: 'node-0',
            type: 'central',
            data: { label: data.title },
            position: { x: 0, y: 0 },
            style: {
              width: 180,
              height: 60,
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }
          },
          ...Array.from({ length: 5 }, (_, i) => ({
            id: `node-${i + 1}`,
            type: 'default',
            data: { label: `Topic ${i + 1}` },
            position: {
              x: 250 * (i % 2 === 0 ? 1 : -1),
              y: (i % 3) * 100 - 100
            },
            style: {
              width: 120,
              height: 40,
              backgroundColor: '#2196F3',
              color: 'white',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
          })),
          ...Array.from({ length: 5 }, (_, i) => ({
            id: `edge-${i + 1}`,
            source: 'node-0',
            target: `node-${i + 1}`,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#888'
            }
          }))
        ]
      });
    }, 1500);
  });
};

const mockGenerateMindMap = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Parse content to create nodes and edges
      const lines = data.content.split('\n').filter(line => line.trim());
      const elements = [
        {
          id: 'node-0',
          type: 'central',
          data: { label: data.title },
          position: { x: 0, y: 0 },
          style: {
            width: 180,
            height: 60,
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: '30px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }
      ];
      
      lines.forEach((line, i) => {
        // Determine indentation level
        const indent = line.length - line.trimStart().length;
        const level = Math.floor(indent / 2) + 1;
        
        // Create node
        const node = {
          id: `node-${i + 1}`,
          type: 'default',
          data: { label: line.trim() },
          position: {
            x: level * 250 * (i % 2 === 0 ? 1 : -1),
            y: (i % 4) * 100 - 150
          },
          style: {
            width: 150,
            height: 40,
            backgroundColor: '#2196F3',
            color: 'white',
            borderRadius: '5px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }
        };
        elements.push(node);
        
        // Create edge
        const edge = {
          id: `edge-${i + 1}`,
          source: level === 1 ? 'node-0' : `node-${Math.max(1, i)}`,
          target: `node-${i + 1}`,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#888'
          }
        };
        elements.push(edge);
      });
      
      resolve({
        board_id: 'xyz789',
        title: data.title,
        description: data.description,
        elements
      });
    }, 2000);
  });
};

const mockListBoards = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        boards: [
          {
            board_id: 'abc123',
            title: 'แผนธุรกิจปี 2025',
            description: 'แผนธุรกิจและเป้าหมายสำหรับปี 2025',
            template: 'mind_map',
            created_at: '2025-07-19T10:30:00Z',
            updated_at: '2025-07-19T11:45:00Z'
          },
          {
            board_id: 'def456',
            title: 'โครงสร้างองค์กร',
            description: 'โครงสร้างองค์กรและทีมงาน',
            template: 'mind_map',
            created_at: '2025-07-18T14:20:00Z',
            updated_at: '2025-07-18T15:30:00Z'
          },
          {
            board_id: 'ghi789',
            title: 'แผนการตลาด Q3 2025',
            description: 'แผนการตลาดและกลยุทธ์สำหรับไตรมาส 3 ปี 2025',
            template: 'mind_map',
            created_at: '2025-07-17T09:15:00Z',
            updated_at: '2025-07-17T10:20:00Z'
          }
        ],
        total: 3
      });
    }, 800);
  });
};

const mockGetBoard = (boardId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        board_id: boardId,
        title: 'แผนธุรกิจปี 2025',
        description: 'แผนธุรกิจและเป้าหมายสำหรับปี 2025',
        elements: [
          {
            id: 'node-0',
            type: 'central',
            data: { label: 'แผนธุรกิจปี 2025' },
            position: { x: 0, y: 0 },
            style: {
              width: 180,
              height: 60,
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }
          },
          {
            id: 'node-1',
            type: 'default',
            data: { label: 'การตลาด' },
            position: { x: 250, y: -100 },
            style: {
              width: 120,
              height: 40,
              backgroundColor: '#2196F3',
              color: 'white',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
          },
          {
            id: 'node-2',
            type: 'default',
            data: { label: 'การเงิน' },
            position: { x: -250, y: -100 },
            style: {
              width: 120,
              height: 40,
              backgroundColor: '#2196F3',
              color: 'white',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
          },
          {
            id: 'node-3',
            type: 'default',
            data: { label: 'การผลิต' },
            position: { x: 250, y: 0 },
            style: {
              width: 120,
              height: 40,
              backgroundColor: '#2196F3',
              color: 'white',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
          },
          {
            id: 'node-4',
            type: 'default',
            data: { label: 'ทรัพยากรบุคคล' },
            position: { x: -250, y: 0 },
            style: {
              width: 120,
              height: 40,
              backgroundColor: '#2196F3',
              color: 'white',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
          },
          {
            id: 'node-5',
            type: 'default',
            data: { label: 'เทคโนโลยี' },
            position: { x: 250, y: 100 },
            style: {
              width: 120,
              height: 40,
              backgroundColor: '#2196F3',
              color: 'white',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }
          },
          {
            id: 'edge-1',
            source: 'node-0',
            target: 'node-1',
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#888'
            }
          },
          {
            id: 'edge-2',
            source: 'node-0',
            target: 'node-2',
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#888'
            }
          },
          {
            id: 'edge-3',
            source: 'node-0',
            target: 'node-3',
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#888'
            }
          },
          {
            id: 'edge-4',
            source: 'node-0',
            target: 'node-4',
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#888'
            }
          },
          {
            id: 'edge-5',
            source: 'node-0',
            target: 'node-5',
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#888'
            }
          }
        ]
      });
    }, 1000);
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

function MindMap() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [generateDialog, setGenerateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'flow'

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setBoardsLoading(true);
    try {
      const response = await mockListBoards();
      setBoards(response.boards);
    } catch (error) {
      console.error('Error loading boards:', error);
      showSnackbar('ไม่สามารถโหลดรายการ Mind Map ได้', 'error');
    } finally {
      setBoardsLoading(false);
    }
  };

  const loadBoard = async (boardId) => {
    setLoading(true);
    try {
      const response = await mockGetBoard(boardId);
      setCurrentBoard(response);
      
      // Convert elements to nodes and edges for ReactFlow
      const flowNodes = [];
      const flowEdges = [];
      
      response.elements.forEach(element => {
        if (element.source) {
          // It's an edge
          flowEdges.push({
            id: element.id,
            source: element.source,
            target: element.target,
            type: element.type,
            animated: element.animated,
            style: element.style
          });
        } else {
          // It's a node
          flowNodes.push({
            id: element.id,
            type: element.type,
            data: element.data,
            position: element.position,
            style: element.style
          });
        }
      });
      
      setNodes(flowNodes);
      setEdges(flowEdges);
      setViewMode('flow');
    } catch (error) {
      console.error('Error loading board:', error);
      showSnackbar('ไม่สามารถโหลด Mind Map ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMindMap = async () => {
    if (!formData.title) {
      showSnackbar('กรุณาระบุชื่อ Mind Map', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const result = await mockCreateMindMap(formData);
      setCurrentBoard(result);
      
      // Convert elements to nodes and edges for ReactFlow
      const flowNodes = [];
      const flowEdges = [];
      
      result.elements.forEach(element => {
        if (element.source) {
          // It's an edge
          flowEdges.push({
            id: element.id,
            source: element.source,
            target: element.target,
            type: element.type,
            animated: element.animated,
            style: element.style
          });
        } else {
          // It's a node
          flowNodes.push({
            id: element.id,
            type: element.type,
            data: element.data,
            position: element.position,
            style: element.style
          });
        }
      });
      
      setNodes(flowNodes);
      setEdges(flowEdges);
      setCreateDialog(false);
      setViewMode('flow');
      showSnackbar('สร้าง Mind Map สำเร็จ', 'success');
      
      // Refresh boards list
      loadBoards();
    } catch (error) {
      console.error('Error creating mind map:', error);
      showSnackbar('ไม่สามารถสร้าง Mind Map ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMindMap = async () => {
    if (!formData.title || !formData.content) {
      showSnackbar('กรุณาระบุชื่อและเนื้อหา', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const result = await mockGenerateMindMap(formData);
      setCurrentBoard(result);
      
      // Convert elements to nodes and edges for ReactFlow
      const flowNodes = [];
      const flowEdges = [];
      
      result.elements.forEach(element => {
        if (element.source) {
          // It's an edge
          flowEdges.push({
            id: element.id,
            source: element.source,
            target: element.target,
            type: element.type,
            animated: element.animated,
            style: element.style
          });
        } else {
          // It's a node
          flowNodes.push({
            id: element.id,
            type: element.type,
            data: element.data,
            position: element.position,
            style: element.style
          });
        }
      });
      
      setNodes(flowNodes);
      setEdges(flowEdges);
      setGenerateDialog(false);
      setViewMode('flow');
      showSnackbar('สร้าง Mind Map จากเนื้อหาสำเร็จ', 'success');
      
      // Refresh boards list
      loadBoards();
    } catch (error) {
      console.error('Error generating mind map:', error);
      showSnackbar('ไม่สามารถสร้าง Mind Map จากเนื้อหาได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentBoard(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {viewMode === 'list' ? 'Mind Maps' : currentBoard?.title || 'Mind Map'}
        </Typography>
        <Box>
          {viewMode === 'list' ? (
            <>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    content: ''
                  });
                  setGenerateDialog(true);
                }}
                sx={{ mr: 1 }}
              >
                สร้างจากเนื้อหา
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    content: ''
                  });
                  setCreateDialog(true);
                }}
              >
                สร้าง Mind Map
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                onClick={handleBackToList}
                sx={{ mr: 1 }}
              >
                กลับไปยังรายการ
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
              >
                บันทึก
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Content */}
      {viewMode === 'list' ? (
        <Box>
          {boardsLoading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress />
            </Box>
          ) : boards.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                ไม่พบ Mind Map
              </Typography>
              <Typography variant="body2" color="text.secondary">
                คุณยังไม่มี Mind Map กดปุ่ม "สร้าง Mind Map" เพื่อเริ่มต้น
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {boards.map((board) => (
                <Grid item xs={12} sm={6} md={4} key={board.board_id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" gutterBottom noWrap>
                          {board.title}
                        </Typography>
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      {board.description && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {board.description}
                        </Typography>
                      )}
                      <Box display="flex" alignItems="center" mb={2}>
                        <Chip
                          label="Mind Map"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        สร้างเมื่อ: {formatDate(board.created_at)}
                      </Typography>
                      {board.updated_at && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          แก้ไขล่าสุด: {formatDate(board.updated_at)}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => loadBoard(board.board_id)}
                      >
                        แก้ไข
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ShareIcon />}
                      >
                        แชร์
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : (
        <Box sx={{ height: 'calc(100vh - 180px)', border: '1px solid #ddd', borderRadius: '4px' }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          )}
        </Box>
      )}

      {/* Create Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>สร้าง Mind Map</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อ Mind Map"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="คำอธิบาย (ไม่บังคับ)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleCreateMindMap}
            variant="contained"
            disabled={loading || !formData.title}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            สร้าง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog
        open={generateDialog}
        onClose={() => setGenerateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>สร้าง Mind Map จากเนื้อหา</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อ Mind Map"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="คำอธิบาย (ไม่บังคับ)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="เนื้อหา"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                multiline
                rows={10}
                required
                helperText="ใส่เนื้อหาที่ต้องการสร้าง Mind Map โดยใช้การเว้นวรรคเพื่อกำหนดระดับของหัวข้อ"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleGenerateMindMap}
            variant="contained"
            disabled={loading || !formData.title || !formData.content}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            สร้าง
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

export default MindMap;

