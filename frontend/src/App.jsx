import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EnhancedLayout from './components/EnhancedLayout';
import EnhancedDashboard from './components/EnhancedDashboard';
import EnhancedFileUpload from './components/EnhancedFileUpload';
import EnhancedChat from './components/EnhancedChat';
import PromptGenerator from './components/PromptGenerator';
import ToolGenerator from './components/ToolGenerator';
import Profile from './components/Profile';
import WorkStorage from './components/WorkStorage';
import ContentSharing from './components/ContentSharing';
import MindMap from './components/MindMap';
import GraphView from './components/GraphView';
import Board from './components/Board';
import { Box, Typography } from '@mui/material';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <EnhancedDashboard />;
      case 'chat':
        return <EnhancedChat />;
      case 'prompt':
        return <PromptGenerator />;
      case 'tool':
        return <ToolGenerator />;
      case 'rag':
        return <EnhancedFileUpload />;
      case 'work-storage':
        return <WorkStorage />;
      case 'profile':
        return <Profile />;
      case 'share':
        return <ContentSharing />;
      case 'board':
        return <Board />;
      case 'graph':
        return <GraphView />;
      case 'mind-map':
        return <MindMap />;
      case 'settings':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              การตั้งค่า
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ฟีเจอร์นี้จะพัฒนาในเฟสถัดไป - การตั้งค่าระบบและผู้ใช้
            </Typography>
          </Box>
        );
      default:
        return <EnhancedDashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EnhancedLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </EnhancedLayout>
    </ThemeProvider>
  );
}

export default App;
