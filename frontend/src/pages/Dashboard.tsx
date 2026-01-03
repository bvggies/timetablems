import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import { 
  CalendarToday, 
  School, 
  People, 
  Notifications,
  TrendingUp,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';

const Dashboard: React.FC = () => {
  const user = authService.getStoredUser();
  const theme = useTheme();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      return {
        upcomingClasses: 3,
        registeredCourses: 5,
        notifications: 4,
        totalStudents: 1200,
      };
    },
  });

  const statCards = [
    {
      title: 'Upcoming Classes',
      value: stats?.upcomingClasses || 0,
      icon: <CalendarToday />,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    {
      title: 'Registered Courses',
      value: stats?.registeredCourses || 0,
      icon: <School />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    },
    {
      title: 'Notifications',
      value: stats?.notifications || 0,
      icon: <Notifications />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            title: 'Total Students',
            value: stats?.totalStudents || 0,
            icon: <People />,
            color: '#ec4899',
            gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
          },
        ]
      : []),
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              : 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Here's what's happening with your timetable today
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: theme.palette.mode === 'light'
                  ? 'white'
                  : alpha(theme.palette.background.paper, 0.8),
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: card.gradient,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      background: card.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: `0 4px 12px ${alpha(card.color, 0.3)}`,
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { fontSize: 28 } })}
                  </Box>
                  <TrendingUp 
                    sx={{ 
                      color: card.color,
                      opacity: 0.3,
                      fontSize: 32,
                    }} 
                  />
                </Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 0.5,
                    color: card.color,
                  }}
                >
                  {card.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontWeight: 500 }}
                >
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 4,
              background: theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
                : alpha(theme.palette.background.paper, 0.6),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarToday 
                sx={{ 
                  mr: 2, 
                  color: 'primary.main',
                  fontSize: 32,
                }} 
              />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Today's Schedule
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your schedule will appear here once courses are registered
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
