import React, { useState, useMemo } from 'react';
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
  TextField,
  InputAdornment,
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
  CheckCircle,
  Event,
  Announcement,
  Group,
  History,
  Monitor,
  Sync,
  Person,
  Settings,
  Search,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth';
import Logo from '../Logo';

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
  const [searchTerm, setSearchTerm] = useState('');

  const menuItems = useMemo(() => [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Timetable', icon: <CalendarToday />, path: '/timetable' },
    ...(user?.role === 'ADMIN'
      ? [{ text: 'Manage Timetable', icon: <CalendarToday />, path: '/timetable/manage' }]
      : []),
    ...(user?.role === 'LECTURER'
      ? [{ text: 'My Timetable Sessions', icon: <CalendarToday />, path: '/timetable/my-sessions' }]
      : []),
    { text: 'Courses', icon: <School />, path: '/courses' },
    ...(user?.role === 'STUDENT'
      ? [{ text: 'Register Courses', icon: <School />, path: '/courses/register' }]
      : []),
    ...(user?.role === 'ADMIN' || user?.role === 'LECTURER'
      ? [{ text: 'Students', icon: <People />, path: '/students' }]
      : []),
    ...(user?.role === 'ADMIN'
      ? [{ text: 'Lecturers', icon: <Person />, path: '/lecturers' }]
      : []),
    ...(user?.role === 'LECTURER'
      ? [{ text: 'My Course Students', icon: <People />, path: '/courses/my-students' }]
      : []),
    ...(user?.role === 'ADMIN' || user?.role === 'LECTURER'
      ? [{ text: 'Attendance', icon: <CheckCircle />, path: '/attendance' }]
      : []),
    { text: 'Calendar', icon: <Event />, path: '/calendar' },
    { text: 'Announcements', icon: <Announcement />, path: '/announcements' },
    ...(user?.role === 'ADMIN'
      ? [
          { text: 'Venues', icon: <LocationOn />, path: '/venues' },
          { text: 'Resource Booking', icon: <Event />, path: '/resources' },
          { text: 'Student Groups', icon: <Group />, path: '/student-groups' },
          { text: 'Reports', icon: <Assessment />, path: '/reports' },
          { text: 'Timetable Versions', icon: <History />, path: '/timetable/versions' },
          { text: 'System Health', icon: <Monitor />, path: '/admin/health' },
          { text: 'Integrations', icon: <Sync />, path: '/admin/integrations' },
        ]
      : []),
    ...(user?.role === 'LECTURER'
      ? [{ text: 'Student Groups', icon: <Group />, path: '/student-groups' }]
      : []),
    { text: 'Exams', icon: <School />, path: '/exams' },
    { text: 'Notifications', icon: <Notifications />, path: '/notifications' },
    { text: 'Support Tickets', icon: <Help />, path: '/support' },
    { text: 'Help & FAQ', icon: <Help />, path: '/help' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ], [user?.role]);

  // Filter menu items based on search term
  const filteredMenuItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return menuItems;
    }
    const searchLower = searchTerm.toLowerCase();
    return menuItems.filter((item) =>
      item.text.toLowerCase().includes(searchLower)
    );
  }, [menuItems, searchTerm]);

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
          minHeight: '100px !important',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 2,
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Logo size={32} variant="icon" color="white" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.875rem' }}>
              PUG Timetable
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
              {user?.role || 'User'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', justifyContent: 'center' }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {user?.firstName?.[0] || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.8125rem' }} noWrap>
              {user?.firstName} {user?.lastName}
            </Typography>
          </Box>
        </Box>
        {isMobile && (
          <IconButton 
            onClick={onClose} 
            sx={{ 
              color: 'white',
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      {/* Search Bar */}
      <Box sx={{ px: 2, py: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search menu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme.palette.mode === 'light' 
                ? 'rgba(0, 0, 0, 0.02)' 
                : 'rgba(255, 255, 255, 0.05)',
              '& fieldset': {
                borderColor: theme.palette.mode === 'light' 
                  ? 'rgba(0, 0, 0, 0.08)' 
                  : 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover fieldset': {
                borderColor: theme.palette.mode === 'light' 
                  ? 'rgba(0, 0, 0, 0.15)' 
                  : 'rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: theme.palette.primary.main,
              },
            },
          }}
        />
      </Box>
      <Divider />
      <List sx={{ px: 1.5, py: 2 }}>
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item) => {
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
          })
        ) : (
          <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No menu items found
            </Typography>
          </Box>
        )}
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
