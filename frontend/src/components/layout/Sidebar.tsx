import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  CalendarToday,
  People,
  School,
  LocationOn,
  Notifications,
  Assessment,
  Help,
  Menu as MenuIcon,
  ChevronLeft,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';

const drawerWidth = 280;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const user = authService.getStoredUser();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Timetable', icon: <CalendarToday />, path: '/timetable' },
    ...(user?.role === 'ADMIN'
      ? [{ text: 'Manage Timetable', icon: <CalendarToday />, path: '/timetable/manage' }]
      : []),
    { text: 'Courses', icon: <School />, path: '/courses' },
    ...(user?.role === 'STUDENT'
      ? [{ text: 'Register Courses', icon: <School />, path: '/courses/register' }]
      : []),
    ...(user?.role === 'ADMIN' || user?.role === 'LECTURER'
      ? [{ text: 'Students', icon: <People />, path: '/students' }]
      : []),
    ...(user?.role === 'ADMIN'
      ? [
          { text: 'Venues', icon: <LocationOn />, path: '/venues' },
          { text: 'Reports', icon: <Assessment />, path: '/reports' },
        ]
      : []),
    { text: 'Exams', icon: <School />, path: '/exams' },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
    { text: 'Support Tickets', icon: <Help />, path: '/support' },
    { text: 'Help & FAQ', icon: <Help />, path: '/help' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawer = (
    <>
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          minHeight: '80px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
            }}
          >
            {user?.firstName?.[0] || 'P'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
              {user?.role || 'User'}
            </Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.25,
                  px: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                    color: theme.palette.mode === 'light' ? '#6366f1' : '#a5b4fc',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.mode === 'light' ? '#6366f1' : '#a5b4fc',
                    },
                  },
                  '&:hover': {
                    background: theme.palette.mode === 'light' 
                      ? 'rgba(99, 102, 241, 0.08)' 
                      : 'rgba(129, 140, 248, 0.1)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected 
                      ? (theme.palette.mode === 'light' ? '#6366f1' : '#a5b4fc')
                      : 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.9375rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          boxShadow: theme.palette.mode === 'light' 
            ? '2px 0 8px rgba(0,0,0,0.05)' 
            : '2px 0 8px rgba(0,0,0,0.3)',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;
