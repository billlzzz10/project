import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Grid
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  Code as CodeIcon,
  InsertDriveFile as TextIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Mock API functions (replace with actual API calls)
const mockUploadFile = (file) => {
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

const mockGetFiles = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        files: [
          {
            id: 1,
            original_filename: 'business_report.pdf',
            file_type: 'pdf',
            file_size: 1024 * 1024 * 2.5,
            created_at: '2025-07-18T10:30:00Z',
            is_processed: true
          },
          {
            id: 2,
            original_filename: 'sales_data.csv',
            file_type: 'csv',
            file_size: 1024 * 512,
            created_at: '2025-07-17T14:20:00Z',
            is_processed: true
          },
          {
            id: 3,
            original_filename: 'project_plan.docx',
            file_type: 'docx',
            file_size: 1024 * 1024 * 1.2,
            created_at: '2025-07-16T09:15:00Z',
            is_processed: true
          }
        ],
        total: 3
      });
    }, 500);
  });
};

const mockDeleteFile = (fileId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 800);
  });
};

const mockSearchDocuments = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        results: [
          {
            id: 1,
            title: 'Business Report 2025',
            content: 'This report contains financial data and projections for 2025...',
            similarity_score: 0.92
          },
          {
            id: 2,
            title: 'Sales Data Q2',
            content: 'Quarterly sales data shows a 15% increase compared to last year...',
            similarity_score: 0.85
          }
        ]
      });
    }, 1000);
  });
};

const mockSearchNotion = (query) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        pages: [
          {
            id: 'abc123',
            title: 'Marketing Strategy',
            url: 'https://notion.so/abc123',
            last_edited: '2025-07-15T08:30:00Z'
          },
          {
            id: 'def456',
            title: 'Product Roadmap',
            url: 'https://notion.so/def456',
            last_edited: '2025-07-10T11:45:00Z'
          }
        ]
      });
    }, 1000);
  });
};

const mockAddNotionPage = (pageId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1200);
  });
};

function getFileIcon(fileType) {
  switch (fileType) {
    case 'pdf':
      return <PdfIcon color="error" />;
    case 'csv':
    case 'xlsx':
    case 'xls':
      return <CodeIcon color="success" />;
    case 'docx':
    case 'doc':
    case 'pptx':
    case 'ppt':
      return <FileIcon color="primary" />;
    case 'md':
    case 'txt':
    case 'html':
      return <TextIcon color="secondary" />;
    default:
      return <FileIcon />;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

function EnhancedFileUpload() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [notionPages, setNotionPages] = useState([]);
  const [notionSearching, setNotionSearching] = useState(false);
  const [notionQuery, setNotionQuery] = useState('');
  const [notionPageId, setNotionPageId] = useState('');
  const [addingNotionPage, setAddingNotionPage] = useState(false);
  const [openNotionDialog, setOpenNotionDialog] = useState(false);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    fileId: null
  });

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await mockGetFiles();
      setFiles(response.files);
    } catch (error) {
      console.error('Error loading files:', error);
      showSnackbar('ไม่สามารถโหลดไฟล์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await mockUploadFile(file);
      setFiles([response, ...files]);
      showSnackbar('อัปโหลดไฟล์สำเร็จ', 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      showSnackbar('ไม่สามารถอัปโหลดไฟล์ได้', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    setDeleteDialog({ open: false, fileId: null });
    try {
      await mockDeleteFile(fileId);
      setFiles(files.filter(file => file.id !== fileId));
      showSnackbar('ลบไฟล์สำเร็จ', 'success');
    } catch (error) {
      console.error('Error deleting file:', error);
      showSnackbar('ไม่สามารถลบไฟล์ได้', 'error');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await mockSearchDocuments(searchQuery);
      setSearchResults(response.results);
      setOpenSearchDialog(true);
    } catch (error) {
      console.error('Error searching documents:', error);
      showSnackbar('ไม่สามารถค้นหาเอกสารได้', 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleNotionSearch = async () => {
    if (!notionQuery.trim()) return;
    
    setNotionSearching(true);
    try {
      const response = await mockSearchNotion(notionQuery);
      setNotionPages(response.pages);
    } catch (error) {
      console.error('Error searching Notion:', error);
      showSnackbar('ไม่สามารถค้นหาหน้า Notion ได้', 'error');
    } finally {
      setNotionSearching(false);
    }
  };

  const handleAddNotionPage = async () => {
    if (!notionPageId.trim()) return;
    
    setAddingNotionPage(true);
    try {
      await mockAddNotionPage(notionPageId);
      showSnackbar('เพิ่มหน้า Notion สำเร็จ', 'success');
      setOpenNotionDialog(false);
      setNotionPageId('');
    } catch (error) {
      console.error('Error adding Notion page:', error);
      showSnackbar('ไม่สามารถเพิ่มหน้า Notion ได้', 'error');
    } finally {
      setAddingNotionPage(false);
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

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          RAG & ค้นหา
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadFiles}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            รีเฟรช
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
            disabled={uploading}
          >
            อัปโหลดไฟล์
            <input
              type="file"
              hidden
              onChange={handleFileUpload}
              accept=".pdf,.html,.csv,.docx,.doc,.md,.txt,.xlsx,.xls,.pptx,.ppt"
            />
          </Button>
        </Box>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center">
              <TextField
                fullWidth
                label="ค้นหาเอกสาร"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์คำค้นหา..."
                size="small"
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={searching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                sx={{ ml: 1, height: 40 }}
              >
                ค้นหา
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => setOpenNotionDialog(true)}
                sx={{ height: 40 }}
              >
                เพิ่มหน้า Notion
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Files List */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          ไฟล์ที่อัปโหลด
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : files.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            ยังไม่มีไฟล์ที่อัปโหลด กรุณาอัปโหลดไฟล์เพื่อเริ่มใช้งาน RAG
          </Alert>
        ) : (
          <List>
            {files.map((file) => (
              <React.Fragment key={file.id}>
                <ListItem>
                  <ListItemIcon>
                    {getFileIcon(file.file_type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={file.original_filename}
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {formatFileSize(file.file_size)}
                        </Typography>
                        {' — '}
                        {formatDate(file.created_at)}
                      </React.Fragment>
                    }
                  />
                  <Box mr={2}>
                    <Chip
                      label={file.is_processed ? "ประมวลผลแล้ว" : "รอประมวลผล"}
                      color={file.is_processed ? "success" : "warning"}
                      size="small"
                    />
                  </Box>
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => setDeleteDialog({ open: true, fileId: file.id })}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Search Results Dialog */}
      <Dialog
        open={openSearchDialog}
        onClose={() => setOpenSearchDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>ผลการค้นหา: {searchQuery}</DialogTitle>
        <DialogContent>
          {searchResults.length === 0 ? (
            <Alert severity="info">ไม่พบผลลัพธ์ที่ตรงกับคำค้นหา</Alert>
          ) : (
            <List>
              {searchResults.map((result) => (
                <ListItem key={result.id} alignItems="flex-start">
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1">{result.title}</Typography>
                        <Chip
                          label={`${Math.round(result.similarity_score * 100)}% ตรงกัน`}
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={result.content}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSearchDialog(false)}>ปิด</Button>
        </DialogActions>
      </Dialog>

      {/* Notion Dialog */}
      <Dialog
        open={openNotionDialog}
        onClose={() => setOpenNotionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>เพิ่มหน้า Notion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ค้นหาหน้า Notion ที่ต้องการเพิ่มเข้าสู่ระบบ RAG หรือป้อน Page ID โดยตรง
          </DialogContentText>
          
          <Box mt={2} mb={3}>
            <Box display="flex" alignItems="center" mb={2}>
              <TextField
                fullWidth
                label="ค้นหาหน้า Notion"
                variant="outlined"
                value={notionQuery}
                onChange={(e) => setNotionQuery(e.target.value)}
                placeholder="พิมพ์คำค้นหา..."
                size="small"
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={notionSearching ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                onClick={handleNotionSearch}
                disabled={notionSearching || !notionQuery.trim()}
                sx={{ ml: 1, height: 40 }}
              >
                ค้นหา
              </Button>
            </Box>
            
            {notionPages.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ผลการค้นหา
                </Typography>
                <List dense>
                  {notionPages.map((page) => (
                    <ListItem key={page.id} button onClick={() => setNotionPageId(page.id)}>
                      <ListItemIcon>
                        <FileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={page.title}
                        secondary={`แก้ไขล่าสุด: ${formatDate(page.last_edited)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            
            <TextField
              fullWidth
              label="Notion Page ID"
              variant="outlined"
              value={notionPageId}
              onChange={(e) => setNotionPageId(e.target.value)}
              placeholder="ป้อน Page ID โดยตรง"
              helperText="ตัวอย่าง: abc123def456"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNotionDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleAddNotionPage}
            color="primary"
            variant="contained"
            disabled={addingNotionPage || !notionPageId.trim()}
            startIcon={addingNotionPage ? <CircularProgress size={20} color="inherit" /> : null}
          >
            เพิ่มหน้า
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, fileId: null })}
      >
        <DialogTitle>ยืนยันการลบไฟล์</DialogTitle>
        <DialogContent>
          <DialogContentText>
            คุณต้องการลบไฟล์นี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, fileId: null })}>
            ยกเลิก
          </Button>
          <Button
            onClick={() => handleDeleteFile(deleteDialog.fileId)}
            color="error"
            variant="contained"
          >
            ลบไฟล์
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

export default EnhancedFileUpload;

