import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  CircularProgress,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

// Mock API functions
const mockGetProfile = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user_id: 1,
        display_name: 'ธนพล สมิธ',
        email: 'thanapol.s@example.com',
        bio: 'นักวิเคราะห์ข้อมูลและนักพัฒนาธุรกิจ ชอบทำงานกับข้อมูลและหาโอกาสทางธุรกิจใหม่ๆ',
        avatar_url: '',
        preferences: {
          theme: 'light',
          language: 'th',
          notifications: {
            email: true,
            push: true
          }
        },
        created_at: '2025-01-15T10:30:00Z',
        updated_at: '2025-07-10T14:20:00Z'
      });
    }, 500);
  });
};

const mockUpdateProfile = (profileData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...profileData,
        updated_at: new Date().toISOString()
      });
    }, 800);
  });
};

const mockGetStats = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        chat_count: 85,
        message_count: 1250,
        file_count: 120,
        work_item_count: 45
      });
    }, 300);
  });
};

function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await mockGetProfile();
      setProfile(data);
      setEditedProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      showSnackbar('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await mockGetStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      // Cancel editing
      setEditedProfile(profile);
    }
    setEditing(!editing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile({
      ...editedProfile,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updatedProfile = await mockUpdateProfile(editedProfile);
      setProfile(updatedProfile);
      setEditing(false);
      showSnackbar('บันทึกโปรไฟล์สำเร็จ', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showSnackbar('ไม่สามารถบันทึกโปรไฟล์ได้', 'error');
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box p={3}>
        <Alert severity="error">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง</Alert>
        <Button
          variant="contained"
          onClick={loadProfile}
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
          โปรไฟล์
        </Typography>
        <Button
          variant={editing ? 'outlined' : 'contained'}
          startIcon={editing ? <CancelIcon /> : <EditIcon />}
          onClick={handleEditToggle}
          color={editing ? 'error' : 'primary'}
        >
          {editing ? 'ยกเลิก' : 'แก้ไขโปรไฟล์'}
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
          <Tab label="ข้อมูลส่วนตัว" />
          <Tab label="การตั้งค่า" />
          <Tab label="สถิติการใช้งาน" />
        </Tabs>
      </Box>

      {/* Profile Tab */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={4}>
            {/* Avatar Section */}
            <Grid item xs={12} md={4} display="flex" flexDirection="column" alignItems="center">
              <Avatar
                sx={{
                  width: 150,
                  height: 150,
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '4rem'
                }}
                src={profile.avatar_url}
              >
                {profile.display_name.charAt(0)}
              </Avatar>
              {editing && (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                >
                  เปลี่ยนรูปโปรไฟล์
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                  />
                </Button>
              )}
            </Grid>

            {/* Profile Info Section */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  {editing ? (
                    <TextField
                      fullWidth
                      label="ชื่อที่แสดง"
                      name="display_name"
                      value={editedProfile.display_name}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="h5" gutterBottom>
                      {profile.display_name}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  {editing ? (
                    <TextField
                      fullWidth
                      label="อีเมล"
                      name="email"
                      value={editedProfile.email}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {profile.email}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  {editing ? (
                    <TextField
                      fullWidth
                      label="ประวัติโดยย่อ"
                      name="bio"
                      value={editedProfile.bio}
                      onChange={handleInputChange}
                      variant="outlined"
                      multiline
                      rows={4}
                    />
                  ) : (
                    <Typography variant="body1" paragraph>
                      {profile.bio}
                    </Typography>
                  )}
                </Grid>
                {editing && (
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      บันทึกการเปลี่ยนแปลง
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Settings Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            การตั้งค่า
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            ฟีเจอร์นี้จะพัฒนาในเฟสถัดไป - การตั้งค่าระบบและผู้ใช้
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    การแจ้งเตือน
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ตั้งค่าการแจ้งเตือนต่างๆ ในระบบ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ความเป็นส่วนตัว
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    จัดการการตั้งค่าความเป็นส่วนตัวของคุณ
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ภาษาและรูปแบบ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    เปลี่ยนภาษาและรูปแบบการแสดงผล
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    การเชื่อมต่อ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    จัดการการเชื่อมต่อกับบริการภายนอก
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Stats Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            สถิติการใช้งาน
          </Typography>
          {stats ? (
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {stats.chat_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      แชททั้งหมด
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" color="secondary">
                      {stats.message_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ข้อความทั้งหมด
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {stats.file_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ไฟล์ทั้งหมด
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {stats.work_item_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      งานทั้งหมด
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <CircularProgress />
          )}
        </Paper>
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

export default Profile;

