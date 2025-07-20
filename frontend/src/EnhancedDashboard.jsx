import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Chat as ChatIcon,
  Description as FileIcon,
  Storage as DatabaseIcon,
  Person as UserIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  PictureAsPdf as PdfIcon,
  Code as CodeIcon,
  InsertDriveFile as TextIcon
} from '@mui/icons-material';

// Mock API functions
const mockGetAnalytics = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        chat_analytics: {
          daily_activity: [
            { date: '2025-07-01', message_count: 12 },
            { date: '2025-07-02', message_count: 19 },
            { date: '2025-07-03', message_count: 15 },
            { date: '2025-07-04', message_count: 22 },
            { date: '2025-07-05', message_count: 30 },
            { date: '2025-07-06', message_count: 18 },
            { date: '2025-07-07', message_count: 25 },
            { date: '2025-07-08', message_count: 32 },
            { date: '2025-07-09', message_count: 28 },
            { date: '2025-07-10', message_count: 35 },
            { date: '2025-07-11', message_count: 42 },
            { date: '2025-07-12', message_count: 38 },
            { date: '2025-07-13', message_count: 30 },
            { date: '2025-07-14', message_count: 25 },
            { date: '2025-07-15', message_count: 32 },
            { date: '2025-07-16', message_count: 40 },
            { date: '2025-07-17', message_count: 45 },
            { date: '2025-07-18', message_count: 38 },
            { date: '2025-07-19', message_count: 30 }
          ],
          total_sessions: 85,
          total_messages: 1250,
          avg_messages_per_session: 14.7,
          most_active_sessions: [
            { session_id: 1, title: 'วิเคราะห์ข้อมูลการขาย', message_count: 45 },
            { session_id: 2, title: 'แผนการตลาดปี 2025', message_count: 32 },
            { session_id: 3, title: 'ข้อมูลลูกค้า', message_count: 28 },
            { session_id: 4, title: 'รายงานการเงิน', message_count: 24 },
            { session_id: 5, title: 'แผนธุรกิจ', message_count: 18 }
          ]
        },
        file_analytics: {
          file_types: [
            { file_type: 'pdf', count: 45, total_size: 128000000 },
            { file_type: 'docx', count: 32, total_size: 64000000 },
            { file_type: 'csv', count: 18, total_size: 12000000 },
            { file_type: 'txt', count: 15, total_size: 5000000 },
            { file_type: 'html', count: 10, total_size: 3000000 }
          ],
          total_files: 120,
          total_size: 212000000,
          recent_uploads: [
            {
              id: 1,
              filename: 'business_report_q2_2025.pdf',
              file_type: 'pdf',
              file_size: 2500000,
              created_at: '2025-07-19T08:30:00Z'
            },
            {
              id: 2,
              filename: 'sales_data.csv',
              file_type: 'csv',
              file_size: 1200000,
              created_at: '2025-07-19T05:45:00Z'
            },
            {
              id: 3,
              filename: 'marketing_strategy.docx',
              file_type: 'docx',
              file_size: 1800000,
              created_at: '2025-07-18T14:20:00Z'
            },
            {
              id: 4,
              filename: 'project_notes.txt',
              file_type: 'txt',
              file_size: 50000,
              created_at: '2025-07-17T11:10:00Z'
            },
            {
              id: 5,
              filename: 'website_backup.html',
              file_type: 'html',
              file_size: 350000,
              created_at: '2025-07-16T09:15:00Z'
            }
          ]
        },
        rag_analytics: {
          source_types: [
            { source_type: 'file', count: 85 },
            { source_type: 'notion', count: 42 },
            { source_type: 'web', count: 23 }
          ],
          total_documents: 150
        },
        system_analytics: {
          user_count: 25,
          work_item_count: 120,
          board_count: 15,
          graph: {
            node_count: 350,
            edge_count: 420
          },
          chat_stats: {
            total_sessions: 85,
            total_messages: 1250
          },
          file_stats: {
            total_files: 120,
            total_size: 212000000
          }
        },
        notion_analytics: {
          total_pages: 42,
          recent_pages: [
            {
              id: 1,
              title: 'แผนการตลาด Q3 2025',
              source_id: 'abc123',
              created_at: '2025-07-18T10:30:00Z'
            },
            {
              id: 2,
              title: 'รายงานการประชุมทีม',
              source_id: 'def456',
              created_at: '2025-07-17T14:20:00Z'
            },
            {
              id: 3,
              title: 'แผนธุรกิจ 2025-2026',
              source_id: 'ghi789',
              created_at: '2025-07-14T09:15:00Z'
            }
          ]
        }
      });
    }, 1000);
  });
};

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function EnhancedDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await mockGetAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      showSnackbar('ไม่สามารถโหลดข้อมูลได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportData = () => {
    showSnackbar('ส่งออกข้อมูลสำเร็จ', 'success');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box p={3}>
        <Alert severity="error">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={loadAnalytics}
          sx={{ mt: 2 }}
        >
          โหลดข้อมูลใหม่
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          แดชบอร์ด
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadAnalytics}
            sx={{ mr: 1 }}
          >
            รีเฟรช
          </Button>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleExportData}>
              <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
              ส่งออกข้อมูล
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} />
              แชร์แดชบอร์ด
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'primary.light',
                    borderRadius: '50%',
                    p: 1,
                    mr: 2
                  }}
                >
                  <ChatIcon color="primary" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {analytics.chat_analytics.total_messages}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ข้อความทั้งหมด
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'success.light',
                    borderRadius: '50%',
                    p: 1,
                    mr: 2
                  }}
                >
                  <FileIcon color="success" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {analytics.file_analytics.total_files}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ไฟล์ทั้งหมด
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'warning.light',
                    borderRadius: '50%',
                    p: 1,
                    mr: 2
                  }}
                >
                  <DatabaseIcon color="warning" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {analytics.rag_analytics.total_documents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    เอกสาร RAG
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    backgroundColor: 'secondary.light',
                    borderRadius: '50%',
                    p: 1,
                    mr: 2
                  }}
                >
                  <UserIcon color="secondary" />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {analytics.system_analytics.user_count}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ผู้ใช้งาน
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="ภาพรวม" />
          <Tab label="แชท" />
          <Tab label="ไฟล์" />
          <Tab label="RAG" />
          <Tab label="Notion" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Chat Activity Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                กิจกรรมแชทล่าสุด
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={analytics.chat_analytics.daily_activity}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="message_count"
                    name="จำนวนข้อความ"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* File Types Chart */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                ประเภทไฟล์
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.file_analytics.file_types}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="file_type"
                    label={({ file_type, count }) => `${file_type}: ${count}`}
                  >
                    {analytics.file_analytics.file_types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.file_type]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* RAG Sources Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                แหล่งข้อมูล RAG
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.rag_analytics.source_types}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source_type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="จำนวนเอกสาร" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Recent Uploads */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ไฟล์ที่อัปโหลดล่าสุด
              </Typography>
              <List>
                {analytics.file_analytics.recent_uploads.slice(0, 5).map((file) => (
                  <ListItem key={file.id}>
                    <ListItemIcon>
                      {getFileIcon(file.file_type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.filename}
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
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Chat Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                กิจกรรมแชทรายวัน
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={analytics.chat_analytics.daily_activity}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="message_count"
                    name="จำนวนข้อความ"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                สถิติแชท
              </Typography>
              <Box p={2}>
                <Typography variant="body1">
                  <strong>จำนวนแชททั้งหมด:</strong> {analytics.chat_analytics.total_sessions}
                </Typography>
                <Typography variant="body1" mt={1}>
                  <strong>จำนวนข้อความทั้งหมด:</strong> {analytics.chat_analytics.total_messages}
                </Typography>
                <Typography variant="body1" mt={1}>
                  <strong>ข้อความเฉลี่ยต่อแชท:</strong> {analytics.chat_analytics.avg_messages_per_session}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                แชทที่มีกิจกรรมมากที่สุด
              </Typography>
              <List dense>
                {analytics.chat_analytics.most_active_sessions.map((session) => (
                  <ListItem key={session.session_id}>
                    <ListItemIcon>
                      <ChatIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={session.title}
                      secondary={`${session.message_count} ข้อความ`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Files Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ประเภทไฟล์
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics.file_analytics.file_types}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="file_type"
                    label={({ file_type, count }) => `${file_type}: ${count}`}
                  >
                    {analytics.file_analytics.file_types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.file_type]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ขนาดไฟล์ตามประเภท
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={analytics.file_analytics.file_types}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="file_type" />
                  <YAxis tickFormatter={(value) => formatFileSize(value)} />
                  <Tooltip formatter={(value) => formatFileSize(value)} />
                  <Legend />
                  <Bar dataKey="total_size" name="ขนาดไฟล์รวม" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                ไฟล์ที่อัปโหลดล่าสุด
              </Typography>
              <List>
                {analytics.file_analytics.recent_uploads.map((file) => (
                  <ListItem key={file.id}>
                    <ListItemIcon>
                      {getFileIcon(file.file_type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.filename}
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
                    <Chip
                      label={file.file_type.toUpperCase()}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* RAG Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                แหล่งข้อมูล RAG
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={analytics.rag_analytics.source_types}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source_type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="จำนวนเอกสาร" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                สัดส่วนแหล่งข้อมูล
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics.rag_analytics.source_types}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="source_type"
                    label={({ source_type, count }) => `${source_type}: ${count}`}
                  >
                    {analytics.rag_analytics.source_types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.source_type]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                สถิติ RAG
              </Typography>
              <Box p={2}>
                <Typography variant="body1">
                  <strong>จำนวนเอกสารทั้งหมด:</strong> {analytics.rag_analytics.total_documents}
                </Typography>
                <Typography variant="body1" mt={1}>
                  <strong>จำนวนเอกสารจากไฟล์:</strong> {analytics.rag_analytics.source_types.find(s => s.source_type === 'file')?.count || 0}
                </Typography>
                <Typography variant="body1" mt={1}>
                  <strong>จำนวนเอกสารจาก Notion:</strong> {analytics.rag_analytics.source_types.find(s => s.source_type === 'notion')?.count || 0}
                </Typography>
                <Typography variant="body1" mt={1}>
                  <strong>จำนวนเอกสารจากเว็บ:</strong> {analytics.rag_analytics.source_types.find(s => s.source_type === 'web')?.count || 0}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Notion Tab */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                สถิติ Notion
              </Typography>
              <Box p={2}>
                <Typography variant="body1">
                  <strong>จำนวนหน้า Notion ทั้งหมด:</strong> {analytics.notion_analytics.total_pages}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                หน้า Notion ล่าสุด
              </Typography>
              <List>
                {analytics.notion_analytics.recent_pages.map((page) => (
                  <ListItem key={page.id}>
                    <ListItemIcon>
                      <FileIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={page.title}
                      secondary={formatDate(page.created_at)}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                สัดส่วนแหล่งข้อมูล RAG
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics.rag_analytics.source_types}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="source_type"
                    label={({ source_type, count }) => `${source_type}: ${count}`}
                  >
                    {analytics.rag_analytics.source_types.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.source_type]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

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

export default EnhancedDashboard;

