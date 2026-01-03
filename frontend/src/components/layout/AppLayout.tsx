import React, { useState } from 'react';
import { Box, Toolbar, useTheme } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, isDarkMode, onThemeToggle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar
        onMenuClick={handleSidebarToggle}
        onThemeToggle={onThemeToggle}
        isDarkMode={isDarkMode}
      />
      <Sidebar open={sidebarOpen} onClose={handleSidebarToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;

