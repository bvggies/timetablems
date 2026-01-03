import React from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { CalendarToday, School, People, Notifications } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';

const Dashboard: React.FC = () => {
  const user = authService.getStoredUser();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // This would be replaced with actual API calls
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
      icon: <CalendarToday sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Registered Courses',
      value: stats?.registeredCourses || 0,
      icon: <School sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Notifications',
      value: stats?.notifications || 0,
      icon: <Notifications sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
    ...(user?.role === 'ADMIN'
      ? [
          {
            title: 'Total Students',
            value: stats?.totalStudents || 0,
            icon: <People sx={{ fontSize: 40 }} />,
            color: '#dc004e',
          },
        ]
      : []),
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's what's happening with your timetable today.
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: card.color, mr: 2 }}>{card.icon}</Box>
                  <Box>
                    <Typography variant="h4">{card.value}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Today's Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your schedule will appear here once courses are registered.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

