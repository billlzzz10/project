import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Tabs,
  Tab
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
  MoreVert as MoreVertIcon,
  ViewColumn as ViewColumnIcon,
  ViewStream as ViewStreamIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';

// Mock API functions
const mockCreateBoard = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        board_id: 'abc123',
        title: data.title,
        description: data.description,
        template: data.template,
        elements: []
      });
    }, 1500);
  });
};

const mockListBoards = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        boards: [
          {
            board_id: 'abc123',
            title: 'แผนงานโครงการ A',
            description: 'แผนงานและการติดตามความคืบหน้าของโครงการ A',
            template: 'kanban',
            created_at: '2025-07-19T10:30:00Z',
            updated_at: '2025-07-19T11:45:00Z'
          },
          {
            board_id: 'def456',
            title: 'กระบวนการทำงานฝ่ายการตลาด',
            description: 'ขั้นตอนการทำงานของฝ่ายการตลาด',
            template: 'flowchart',
            created_at: '2025-07-18T14:20:00Z',
            updated_at: '2025-07-18T15:30:00Z'
          },
          {
            board_id: 'ghi789',
            title: 'แผนงานไตรมาส 3',
            description: 'แผนงานและการติดตามความคืบหน้าของไตรมาส 3',
            template: 'kanban',
            created_at: '2025-07-17T09:15:00Z',
            updated_at: '2025-07-17T10:20:00Z'
          }
        ],
        total: 3
      });
    }, 800);
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

function getTemplateLabel(template) {
  switch (template) {
    case 'kanban':
      return 'Kanban Board';
    case 'flowchart':
      return 'Flowchart';
    case 'mind_map':
      return 'Mind Map';
    default:
      return template;
  }
}

function Board() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    template: 'kanban'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [tabValue, setTabValue] = useState(0);

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
      showSnackbar('ไม่สามารถโหลดรายการบอร์ดได้', 'error');
    } finally {
      setBoardsLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!formData.title) {
      showSnackbar('กรุณาระบุชื่อบอร์ด', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const result = await mockCreateBoard(formData);
      setCreateDialog(false);
      showSnackbar('สร้างบอร์ดสำเร็จ', 'success');
      
      // Refresh boards list
      loadBoards();
    } catch (error) {
      console.error('Error creating board:', error);
      showSnackbar('ไม่สามารถสร้างบอร์ดได้', 'error');
    } finally {
      setLoading(false);
    }
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filterBoardsByTemplate = (template) => {
    if (template === 'all') {
      return boards;
    }
    return boards.filter(board => board.template === template);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          บอร์ด (Miro-like)
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                template: 'kanban'
              });
              setCreateDialog(true);
            }}
          >
            สร้างบอร์ด
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="board tabs">
          <Tab label="ทั้งหมด" />
          <Tab label="Kanban" />
          <Tab label="Flowchart" />
        </Tabs>
      </Box>

      {/* Boards List */}
      <Box>
        {boardsLoading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress />
          </Box>
        ) : filterBoardsByTemplate(tabValue === 0 ? 'all' : tabValue === 1 ? 'kanban' : 'flowchart').length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              ไม่พบบอร์ด
            </Typography>
            <Typography variant="body2" color="text.secondary">
              คุณยังไม่มีบอร์ด กดปุ่ม "สร้างบอร์ด" เพื่อเริ่มต้น
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filterBoardsByTemplate(tabValue === 0 ? 'all' : tabValue === 1 ? 'kanban' : 'flowchart').map((board) => (
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
                        icon={board.template === 'kanban' ? <ViewColumnIcon /> : <ViewStreamIcon />}
                        label={getTemplateLabel(board.template)}
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

      {/* Create Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>สร้างบอร์ด</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อบอร์ด"
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
              <FormControl fullWidth>
                <InputLabel>รูปแบบบอร์ด</InputLabel>
                <Select
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  label="รูปแบบบอร์ด"
                >
                  <MenuItem value="kanban">Kanban Board</MenuItem>
                  <MenuItem value="flowchart">Flowchart</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleCreateBoard}
            variant="contained"
            disabled={loading || !formData.title}
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

export default Board;

