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

const drawerWidth = 240;

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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          px: [1],
        }}
      >
        {isMobile && (
          <IconButton onClick={onClose}>
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
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
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default Sidebar;

