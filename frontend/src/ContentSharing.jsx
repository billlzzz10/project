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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  TextareaAutosize
} from '@mui/material';
import {
  Share as ShareIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Description as FileIcon,
  FileCopy as FileCopyIcon,
  PictureAsPdf as PdfIcon,
  Language as LanguageIcon,
  InsertDriveFile as DocIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Mock API functions
const mockShareContent = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        share_id: 'abc123',
        file_path: '/path/to/file.md',
        public_url: '/api/shared/abc123',
        format: data.format
      });
    }, 1000);
  });
};

const mockCreateEmbed = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        embed_id: 'xyz789',
        embed_url: '/api/embed/xyz789',
        embed_code: '<iframe src="/api/embed/xyz789" width="100%" height="500" frameborder="0"></iframe>'
      });
    }, 1000);
  });
};

const mockGetSharedContent = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        shared_items: [
          {
            share_id: 'abc123',
            title: 'รายงานการวิเคราะห์ข้อมูลการขาย Q2 2025',
            format: 'md',
            public_url: '/api/shared/abc123',
            created_at: '2025-07-19T10:30:00Z'
          },
          {
            share_id: 'def456',
            title: 'แผนการตลาดปี 2025-2026',
            format: 'pdf',
            public_url: '/api/shared/def456',
            created_at: '2025-07-18T14:20:00Z'
          },
          {
            share_id: 'ghi789',
            title: 'ข้อมูลลูกค้าและการวิเคราะห์',
            format: 'docx',
            public_url: '/api/shared/ghi789',
            created_at: '2025-07-17T09:15:00Z'
          },
          {
            share_id: 'jkl012',
            title: 'รายงานการเงินประจำเดือน',
            format: 'url',
            public_url: '/api/shared/jkl012',
            created_at: '2025-07-16T11:45:00Z'
          },
          {
            share_id: 'mno345',
            title: 'แผนธุรกิจ 5 ปี',
            format: 'embed',
            public_url: '/api/embed/mno345',
            created_at: '2025-07-15T13:30:00Z'
          }
        ],
        total: 5
      });
    }, 800);
  });
};

const mockDeleteSharedContent = (shareId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
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

function getFormatIcon(format) {
  switch (format) {
    case 'md':
      return <FileIcon />;
    case 'html':
      return <LanguageIcon />;
    case 'docx':
      return <DocIcon />;
    case 'pdf':
      return <PdfIcon />;
    case 'url':
      return <LinkIcon />;
    case 'embed':
      return <CodeIcon />;
    default:
      return <FileIcon />;
  }
}

function getFormatLabel(format) {
  switch (format) {
    case 'md':
      return 'Markdown';
    case 'html':
      return 'HTML';
    case 'docx':
      return 'Word Document';
    case 'pdf':
      return 'PDF';
    case 'url':
      return 'URL';
    case 'embed':
      return 'Embed';
    default:
      return format.toUpperCase();
  }
}

function ContentSharing() {
  const [sharedItems, setSharedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareDialog, setShareDialog] = useState(false);
  const [embedDialog, setEmbedDialog] = useState(false);
  const [resultDialog, setResultDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [shareData, setShareData] = useState({
    title: '',
    content: '',
    content_type: 'text',
    format: 'md'
  });
  const [embedData, setEmbedData] = useState({
    title: '',
    content: '',
    content_type: 'text'
  });
  const [resultData, setResultData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItemId, setMenuItemId] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadSharedContent();
  }, []);

  const loadSharedContent = async () => {
    setLoading(true);
    try {
      const response = await mockGetSharedContent();
      setSharedItems(response.shared_items);
    } catch (error) {
      console.error('Error loading shared content:', error);
      showSnackbar('ไม่สามารถโหลดรายการที่แชร์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShareContent = async () => {
    if (!shareData.title.trim() || !shareData.content.trim()) {
      showSnackbar('กรุณาระบุชื่อและเนื้อหา', 'error');
      return;
    }
    
    setSharing(true);
    try {
      const result = await mockShareContent(shareData);
      setResultData({
        ...result,
        title: shareData.title,
        format: shareData.format
      });
      setShareDialog(false);
      setResultDialog(true);
      showSnackbar('แชร์เนื้อหาสำเร็จ', 'success');
    } catch (error) {
      console.error('Error sharing content:', error);
      showSnackbar('ไม่สามารถแชร์เนื้อหาได้', 'error');
    } finally {
      setSharing(false);
    }
  };

  const handleCreateEmbed = async () => {
    if (!embedData.title.trim() || !embedData.content.trim()) {
      showSnackbar('กรุณาระบุชื่อและเนื้อหา', 'error');
      return;
    }
    
    setSharing(true);
    try {
      const result = await mockCreateEmbed(embedData);
      setResultData({
        ...result,
        title: embedData.title,
        format: 'embed'
      });
      setEmbedDialog(false);
      setResultDialog(true);
      showSnackbar('สร้าง Embed สำเร็จ', 'success');
    } catch (error) {
      console.error('Error creating embed:', error);
      showSnackbar('ไม่สามารถสร้าง Embed ได้', 'error');
    } finally {
      setSharing(false);
    }
  };

  const handleDeleteSharedContent = async () => {
    if (!currentItem) return;
    
    try {
      await mockDeleteSharedContent(currentItem.share_id);
      setSharedItems(sharedItems.filter(item => item.share_id !== currentItem.share_id));
      setDeleteDialog(false);
      setCurrentItem(null);
      showSnackbar('ลบรายการที่แชร์สำเร็จ', 'success');
    } catch (error) {
      console.error('Error deleting shared content:', error);
      showSnackbar('ไม่สามารถลบรายการที่แชร์ได้', 'error');
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showSnackbar('คัดลอกไปยังคลิปบอร์ดแล้ว', 'success');
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        showSnackbar('ไม่สามารถคัดลอกไปยังคลิปบอร์ดได้', 'error');
      });
  };

  const handleMenuOpen = (event, itemId) => {
    setAnchorEl(event.currentTarget);
    setMenuItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuItemId(null);
  };

  const handleDeleteDialog = (item) => {
    setCurrentItem(item);
    setDeleteDialog(true);
    handleMenuClose();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
          แชร์เนื้อหา
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={() => setEmbedDialog(true)}
            sx={{ mr: 1 }}
          >
            สร้าง Embed
          </Button>
          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={() => setShareDialog(true)}
          >
            แชร์เนื้อหา
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="sharing tabs">
          <Tab label="เนื้อหาที่แชร์" />
          <Tab label="Embeds" />
        </Tabs>
      </Box>

      {/* Shared Content Tab */}
      {tabValue === 0 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress />
            </Box>
          ) : sharedItems.filter(item => item.format !== 'embed').length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                ไม่พบเนื้อหาที่แชร์
              </Typography>
              <Typography variant="body2" color="text.secondary">
                คุณยังไม่มีเนื้อหาที่แชร์ กดปุ่ม "แชร์เนื้อหา" เพื่อเริ่มต้น
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {sharedItems
                .filter(item => item.format !== 'embed')
                .map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.share_id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="h6" gutterBottom noWrap>
                            {item.title}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, item.share_id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Chip
                            icon={getFormatIcon(item.format)}
                            label={getFormatLabel(item.format)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          แชร์เมื่อ: {formatDate(item.created_at)}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<LinkIcon />}
                          onClick={() => handleCopyToClipboard(item.public_url)}
                        >
                          คัดลอกลิงก์
                        </Button>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          component="a"
                          href={item.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          ดาวน์โหลด
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Embeds Tab */}
      {tabValue === 1 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" my={5}>
              <CircularProgress />
            </Box>
          ) : sharedItems.filter(item => item.format === 'embed').length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                ไม่พบ Embeds
              </Typography>
              <Typography variant="body2" color="text.secondary">
                คุณยังไม่มี Embeds กดปุ่ม "สร้าง Embed" เพื่อเริ่มต้น
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {sharedItems
                .filter(item => item.format === 'embed')
                .map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.share_id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="h6" gutterBottom noWrap>
                            {item.title}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, item.share_id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Chip
                            icon={<CodeIcon />}
                            label="Embed"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          สร้างเมื่อ: {formatDate(item.created_at)}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<CodeIcon />}
                          onClick={() => handleCopyToClipboard(`<iframe src="${item.public_url}" width="100%" height="500" frameborder="0"></iframe>`)}
                        >
                          คัดลอกโค้ด
                        </Button>
                        <Button
                          size="small"
                          startIcon={<LinkIcon />}
                          onClick={() => handleCopyToClipboard(item.public_url)}
                        >
                          คัดลอกลิงก์
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Item Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const item = sharedItems.find(item => item.share_id === menuItemId);
          if (item) {
            if (item.format === 'embed') {
              handleCopyToClipboard(`<iframe src="${item.public_url}" width="100%" height="500" frameborder="0"></iframe>`);
            } else if (item.format === 'url') {
              handleCopyToClipboard(item.public_url);
            } else {
              handleCopyToClipboard(item.public_url);
            }
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>คัดลอก</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const item = sharedItems.find(item => item.share_id === menuItemId);
          if (item && item.format !== 'embed' && item.format !== 'url') {
            window.open(item.public_url, '_blank');
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ดาวน์โหลด</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const item = sharedItems.find(item => item.share_id === menuItemId);
          if (item) handleDeleteDialog(item);
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>ลบ</ListItemText>
        </MenuItem>
      </Menu>

      {/* Share Dialog */}
      <Dialog
        open={shareDialog}
        onClose={() => setShareDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>แชร์เนื้อหา</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อเนื้อหา"
                value={shareData.title}
                onChange={(e) => setShareData({ ...shareData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="เนื้อหา"
                value={shareData.content}
                onChange={(e) => setShareData({ ...shareData, content: e.target.value })}
                multiline
                rows={8}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>รูปแบบการแชร์</InputLabel>
                <Select
                  value={shareData.format}
                  onChange={(e) => setShareData({ ...shareData, format: e.target.value })}
                  label="รูปแบบการแชร์"
                >
                  <MenuItem value="md">Markdown (.md)</MenuItem>
                  <MenuItem value="html">HTML (.html)</MenuItem>
                  <MenuItem value="docx">Word Document (.docx)</MenuItem>
                  <MenuItem value="pdf">PDF (.pdf)</MenuItem>
                  <MenuItem value="url">URL (ลิงก์)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleShareContent}
            variant="contained"
            disabled={sharing || !shareData.title.trim() || !shareData.content.trim()}
            startIcon={sharing ? <CircularProgress size={20} /> : null}
          >
            แชร์
          </Button>
        </DialogActions>
      </Dialog>

      {/* Embed Dialog */}
      <Dialog
        open={embedDialog}
        onClose={() => setEmbedDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>สร้าง Embed</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ชื่อ Embed"
                value={embedData.title}
                onChange={(e) => setEmbedData({ ...embedData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="เนื้อหา"
                value={embedData.content}
                onChange={(e) => setEmbedData({ ...embedData, content: e.target.value })}
                multiline
                rows={8}
                required
                helperText="สนับสนุน Markdown สำหรับการจัดรูปแบบ"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmbedDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleCreateEmbed}
            variant="contained"
            disabled={sharing || !embedData.title.trim() || !embedData.content.trim()}
            startIcon={sharing ? <CircularProgress size={20} /> : null}
          >
            สร้าง Embed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Dialog */}
      <Dialog
        open={resultDialog}
        onClose={() => setResultDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {resultData?.format === 'embed' ? 'สร้าง Embed สำเร็จ' : 'แชร์เนื้อหาสำเร็จ'}
        </DialogTitle>
        <DialogContent>
          {resultData && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {resultData.title}
                </Typography>
                <Chip
                  icon={getFormatIcon(resultData.format)}
                  label={getFormatLabel(resultData.format)}
                  size="small"
                  color={resultData.format === 'embed' ? 'secondary' : 'primary'}
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              {resultData.format === 'embed' ? (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    โค้ด Embed
                  </Typography>
                  <TextField
                    fullWidth
                    value={resultData.embed_code}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleCopyToClipboard(resultData.embed_code)}
                            edge="end"
                          >
                            <CopyIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    variant="outlined"
                    multiline
                    rows={3}
                  />
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    ลิงก์
                  </Typography>
                  <TextField
                    fullWidth
                    value={resultData.public_url}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleCopyToClipboard(resultData.public_url)}
                            edge="end"
                          >
                            <CopyIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    variant="outlined"
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialog(false)}>ปิด</Button>
          {resultData && resultData.format !== 'embed' && resultData.format !== 'url' && (
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              component="a"
              href={resultData.public_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              ดาวน์โหลด
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการลบ "{currentItem?.title}" ใช่หรือไม่?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>ยกเลิก</Button>
          <Button
            onClick={handleDeleteSharedContent}
            color="error"
            variant="contained"
          >
            ลบ
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

export default ContentSharing;

