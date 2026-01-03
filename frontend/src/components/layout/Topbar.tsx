import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Logout,
  Settings,
  Brightness4,
  Brightness7,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { authService } from '../../services/auth';
import Logo from '../Logo';

interface TopbarProps {
  onMenuClick: () => void;
  onThemeToggle: () => void;
  isDarkMode: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onThemeToggle, isDarkMode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const user = authService.getStoredUser();

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    },
    refetchInterval: 30000,
  });

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
          : 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ 
            mr: 2,
            '&:hover': {
              background: alpha(theme.palette.common.white, 0.1),
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Logo size={28} variant="compact" color="white" />
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '-0.02em',
                color: 'white',
              }}
            >
              Timetable System
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={onThemeToggle}
                  icon={<Brightness7 sx={{ color: 'white' }} />}
                  checkedIcon={<Brightness4 sx={{ color: 'white' }} />}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'white',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: alpha(theme.palette.common.white, 0.3),
                    },
                  }}
                />
              }
              label=""
            />
          </Tooltip>
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              onClick={(e) => setNotificationAnchor(e.currentTarget)}
              sx={{
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              <Badge badgeContent={unreadCount?.count || 0} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Account settings">
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{
                '&:hover': {
                  background: alpha(theme.palette.common.white, 0.1),
                },
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  background: alpha(theme.palette.common.white, 0.2),
                  color: 'white',
                  fontWeight: 600,
                  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
                }}
              >
                {user?.firstName?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 200,
              borderRadius: 2,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            },
          }}
        >
          <MenuItem onClick={handleProfile} sx={{ borderRadius: 1, mx: 1, my: 0.5 }}>
            <Settings sx={{ mr: 1.5, fontSize: 20 }} /> 
            <Typography>Profile Settings</Typography>
          </MenuItem>
          <MenuItem 
            onClick={handleLogout} 
            sx={{ 
              borderRadius: 1, 
              mx: 1, 
              my: 0.5,
              color: 'error.main',
            }}
          >
            <Logout sx={{ mr: 1.5, fontSize: 20 }} /> 
            <Typography>Logout</Typography>
          </MenuItem>
        </Menu>
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 250,
              borderRadius: 2,
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            },
          }}
        >
          <MenuItem 
            onClick={() => {
              navigate('/notifications');
              setNotificationAnchor(null);
            }}
            sx={{ borderRadius: 1, mx: 1, my: 0.5 }}
          >
            View all notifications
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
