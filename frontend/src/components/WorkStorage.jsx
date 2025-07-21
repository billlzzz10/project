import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  Menu,
  MenuItem,
  InputAdornment,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Description as FileIcon,
  Folder as FolderIcon,
  Share as ShareIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Label as LabelIcon
} from '@mui/icons-material';

// Mock API functions
const mockGetWorkItems = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        work_items: [
          {
            id: 1,
            title: 'รายงานการวิเคราะห์ข้อมูลการขาย Q2 2025',
            description: 'วิเคราะห์ข้อมูลการขายไตรมาสที่ 2 ปี 2025 และแนวโน้มการเติบโต',
            content: 'เนื้อหารายงานการวิเคราะห์ข้อมูลการขาย...',
            content_type: 'text',
            tags: ['รายงาน', 'การขาย', 'วิเคราะห์'],
            metadata: {
              source: 'chat',
              session_id: 1
            },
            created_at: '2025-07-15T10:30:00Z',
            updated_at: '2025-07-15T14:20:00Z'
          },
          {
            id: 2,
            title: 'แผนการตลาดปี 2025-2026',
            description: 'แผนการตลาดและกลยุทธ์การเติบโตสำหรับปี 2025-2026',
            content: 'เนื้อหาแผนการตลาด...',
            content_type: 'text',
            tags: ['แผนการตลาด', 'กลยุทธ์'],
            metadata: {
              source: 'chat',
              session_id: 2
            },
            created_at: '2025-07-10T09:15:00Z',
            updated_at: '2025-07-10T11:45:00Z'
          },
          {
            id: 3,
            title: 'ข้อมูลลูกค้าและการวิเคราะห์',
            description: 'ข้อมูลลูกค้าและการวิเคราะห์พฤติกรรมการซื้อ',
            content: 'เนื้อหาข้อมูลลูกค้า...',
            content_type: 'text',
            tags: ['ลูกค้า', 'วิเคราะห์'],
            metadata: {
              source: 'chat',
              session_id: 3
            },
            created_at: '2025-07-05T13:20:00Z',
            updated_at: '2025-07-05T15:30:00Z'
          },
          {
            id: 4,
            title: 'รายงานการเงินประจำเดือน',
            description: 'รายงานการเงินประจำเดือนกรกฎาคม 2025',
            content: 'เนื้อหารายงานการเงิน...',
            content_type: 'text',
            tags: ['การเงิน', 'รายงาน'],
            metadata: {
              source: 'upload',
              file_id: 1
            },
            created_at: '2025-07-01T08:45:00Z',
            updated_at: '2025-07-01T10:15:00Z'
          },
          {
            id: 5,
            title: 'แผนธุรกิจ 5 ปี',
            description: 'แผนธุรกิจระยะยาว 5 ปี (2025-2030)',
            content: 'เนื้อหาแผนธุรกิจ...',
            content_type: 'text',
            tags: ['แผนธุรกิจ', 'ระยะยาว'],
            metadata: {
              source: 'chat',
              session_id: 5
            },
            created_at: '2025-06-20T11:30:00Z',
            updated_at: '2025-06-20T14:45:00Z'
          }
        ],
        total: 5,
        pages: 1,
        current_page: 1,
        per_page: 20
      });
    }, 800);
  });
};

const mockCreateWorkItem = (workItem) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Math.floor(Math.random() * 1000),
        ...workItem,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }, 1000);
  });
};

const mockUpdateWorkItem = (workItem) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...workItem,
        updated_at: new Date().toISOString()
      });
    }, 800);
  });
};

const mockDeleteWorkItem = (itemId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

const mockSearchWorkItems = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        work_items: [
          {
            id: 1,
            title: 'รายงานการวิเคราะห์ข้อมูลการขาย Q2 2025',
            description: 'วิเคราะห์ข้อมูลการขายไตรมาสที่ 2 ปี 2025 และแนวโน้มการเติบโต',
            content_type: 'text',
            tags: ['รายงาน', 'การขาย', 'วิเคราะห์'],
            created_at: '2025-07-15T10:30:00Z'
          }
        ],
        total: 1,
        query: query
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

function WorkStorage() {
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [editItemDialog, setEditItemDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    content: '',
    content_type: 'text',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadWorkItems();
  }, []);

  const loadWorkItems = async () => {
    setLoading(true);
    try {
      const response = await mockGetWorkItems();
      setWorkItems(response.work_items);
    } catch (error) {
      console.error('Error loading work items:', error);
      showSnackbar('ไม่สามารถโหลดรายการงานได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadWorkItems();
      return;
    }
    
    setSearching(true);
    try {
      const response = await mockSearchWorkItems(searchQuery);
      setWorkItems(response.work_items);
    } catch (error) {
      console.error('Error searching work items:', error);
      showSnackbar('ไม่สามารถค้นหารายการงานได้', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.title.trim()) {
      showSnackbar('กรุณาระบุชื่องาน', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const createdItem = await mockCreateWorkItem(newItem);
      setWorkItems([createdItem, ...workItems]);
      setNewItemDialog(false);
      setNewItem({
        title: '',
        description: '',
        content: '',
        content_type: 'text',
        tags: []
      });
      showSnackbar('สร้างงานใหม่สำเร็จ', 'success');
    } catch (error) {
      console.error('Error creating work item:', error);
      showSnackbar('ไม่สามารถสร้างงานใหม่ได้', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!currentItem.title.trim()) {
      showSnackbar('กรุณาระบุชื่องาน', 'error');
      return;
    }
    
    setSaving(true);
    try {
      const updatedItem = await mockUpdateWorkItem(currentItem);
      setWorkItems(workItems.map(item => item.id === updatedItem.id ? updatedItem : item));
      setEditItemDialog(false);
      setCurrentItem(null);
      showSnackbar('อัปเดตงานสำเร็จ', 'success');
    } catch (error) {
      console.error('Error updating work item:', error);
      showSnackbar('ไม่สามารถอัปเดตงานได้', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!currentItem) return;
    
    try {
      await mockDeleteWorkItem(currentItem.id);
      setWorkItems(workItems.filter(item => item.id !== currentItem.id));
      setDeleteDialog(false);
      setCurrentItem(null);
      showSnackbar('ลบงานสำเร็จ', 'success');
    } catch (error) {
      console.error('Error deleting work item:', error);
      showSnackbar('ไม่สามารถลบงานได้', 'error');
    }
  };

  const handleAddTag = (isNewItem = true) => {
    if (!newTag.trim()) return;
    
    if (isNewItem) {
      if (!newItem.tags.includes(newTag)) {
        setNewItem({
          ...newItem,
          tags: [...newItem.tags, newTag]
        });
      }
    } else {
      if (!currentItem.tags.includes(newTag)) {
        setCurrentItem({
          ...currentItem,
          tags: [...currentItem.tags, newTag]
        });
      }
    }
    
    setNewTag('');
  };

  const handleRemoveTag = (tag, isNewItem = true) => {
    if (isNewItem) {
      setNewItem({
        ...newItem,
        tags: newItem.tags.filter(t => t !== tag)
      });
    } else {
      setCurrentItem({
        ...currentItem,
        tags: currentItem.tags.filter(t => t !== tag)
      });
    }
  };

  const handleMenuOpen = (event, itemId) => {
    setAnchorEl(event.currentTarget);
    setMenuItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  const handleEditItem = (item) => {
    setCurrentItem(item);
    setEditItemDialog(true);
    handleMenuClose();
  };

  const handleDeleteDialog = (item) => {
    setCurrentItem(item);
    setDeleteDialog(true);
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

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          คลังเก็บงาน
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewItemDialog(true)}
        >
          สร้างงานใหม่
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            placeholder="ค้นหางาน..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={searching}
            sx={{ ml: 1, height: 40 }}
          >
            {searching ? <CircularProgress size={24} /> : 'ค้นหา'}
          </Button>
        </Box>
      </Paper>

      {/* Work Items Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : workItems.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            ไม่พบรายการงาน
          </Typography>
          <Typography variant="body2" color="text.secondary">
            คุณยังไม่มีงานในคลังเก็บงาน กดปุ่ม "สร้างงานใหม่" เพื่อเริ่มต้น
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {workItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" gutterBottom noWrap>
                      {item.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, item.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {item.description}
                  </Typography>
                  <Box mb={2}>
                    {item.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    สร้างเมื่อ: {formatDate(item.created_at)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditItem(item)}
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

      {/* Item Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const item = workItems.find(item => item.id === menuItemId);
          if (item) handleEditItem(item);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>แก้ไข</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const item = workItems.find(item => item.id === menuItemId);
          if (item) handleDeleteDialog(item);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ลบ</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>แชร์</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>คัดลอก</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ดาวน์โหลด</ListItemText>
        </MenuItem>
      </Menu>

      {/* New Item Dialog */}
      <Dialog
        open={newItemDialog}
        onClose={() => setNewItemDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>สร้างงานใหม่</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่องาน"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="คำอธิบาย"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="เนื้อหา"
                value={newItem.content}
                onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                multiline
                rows={6}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mb={1}>
                <TextField
                  label="แท็ก"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag(true);
                    }
                  }}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleAddTag(true)}
                  startIcon={<AddIcon />}
                >
                  เพิ่มแท็ก
                </Button>
              </Box>
              <Box>
                {newItem.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag, true)}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewItemDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleCreateItem}
            variant="contained"
            disabled={saving || !newItem.title.trim()}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            สร้าง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog
        open={editItemDialog}
        onClose={() => setEditItemDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>แก้ไขงาน</DialogTitle>
        <DialogContent>
          {currentItem && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ชื่องาน"
                  value={currentItem.title}
                  onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="คำอธิบาย"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="เนื้อหา"
                  value={currentItem.content}
                  onChange={(e) => setCurrentItem({ ...currentItem, content: e.target.value })}
                  multiline
                  rows={6}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center" mb={1}>
                  <TextField
                    label="แท็ก"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag(false);
                      }
                    }}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleAddTag(false)}
                    startIcon={<AddIcon />}
                  >
                    เพิ่มแท็ก
                  </Button>
                </Box>
                <Box>
                  {currentItem.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag, false)}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditItemDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleUpdateItem}
            variant="contained"
            disabled={saving || !currentItem?.title.trim()}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>ยืนยันการลบงาน</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการลบงาน "{currentItem?.title}" ใช่หรือไม่?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleDeleteItem}
            color="error"
            variant="contained"
          >
            ลบงาน
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

export default WorkStorage;

