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
  Chip,
  CircularProgress,
} from '@mui/material';
import { 
  CalendarToday, 
  School, 
  People, 
  Notifications,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  PersonAdd,
  Folder,
  Refresh,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import { authService } from '../services/auth';
import NextClassWidget from '../components/NextClassWidget';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const user = authService.getStoredUser();
  const isDark = theme.palette.mode === 'dark';
  const userRole = user?.role;

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: async () => {
      const response = await api.get('/dashboard/analytics');
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute for real-time data
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Unable to load dashboard data
        </Typography>
      </Box>
    );
  }

  // Build stat cards based on user role
  const getStatCards = () => {
    if (userRole === 'STUDENT') {
      return [
        {
          title: 'Registered Courses',
          value: analytics.stats.registeredCourses || 0,
          icon: <School />,
          color: '#6366f1',
          change: null,
          changePositive: null,
        },
        {
          title: 'Upcoming Classes',
          value: analytics.stats.upcomingClasses || 0,
          icon: <CalendarToday />,
          color: '#10b981',
          change: null,
          changePositive: null,
        },
        {
          title: 'Notifications',
          value: analytics.stats.unreadNotifications || 0,
          icon: <Notifications />,
          color: '#f59e0b',
          change: null,
          changePositive: null,
        },
      ];
    } else if (userRole === 'LECTURER') {
      return [
        {
          title: 'Assigned Courses',
          value: analytics.stats.assignedCourses || 0,
          icon: <School />,
          color: '#6366f1',
          change: null,
          changePositive: null,
        },
        {
          title: 'Total Sessions',
          value: analytics.stats.totalSessions || 0,
          icon: <CalendarToday />,
          color: '#10b981',
          change: null,
          changePositive: null,
        },
        {
          title: 'Upcoming Classes',
          value: analytics.stats.upcomingClasses || 0,
          icon: <CalendarToday />,
          color: '#3b82f6',
          change: null,
          changePositive: null,
        },
        {
          title: 'Notifications',
          value: analytics.stats.unreadNotifications || 0,
          icon: <Notifications />,
          color: '#f59e0b',
          change: null,
          changePositive: null,
        },
      ];
    } else if (userRole === 'ADMIN') {
      return [
        {
          title: 'Total Students',
          value: analytics.stats.totalStudents || 0,
          icon: <People />,
          color: '#6366f1',
          change: null,
          changePositive: null,
        },
        {
          title: 'Total Lecturers',
          value: analytics.stats.totalLecturers || 0,
          icon: <PersonAdd />,
          color: '#10b981',
          change: null,
          changePositive: null,
        },
        {
          title: 'Total Courses',
          value: analytics.stats.totalCourses || 0,
          icon: <School />,
          color: '#3b82f6',
          change: null,
          changePositive: null,
        },
        {
          title: 'Total Venues',
          value: analytics.stats.totalVenues || 0,
          icon: <Folder />,
          color: '#ec4899',
          change: null,
          changePositive: null,
        },
        {
          title: 'Total Sessions',
          value: analytics.stats.totalSessions || 0,
          icon: <CalendarToday />,
          color: '#8b5cf6',
          change: null,
          changePositive: null,
        },
        {
          title: 'Notifications',
          value: analytics.stats.unreadNotifications || 0,
          icon: <Notifications />,
          color: '#f59e0b',
          change: null,
          changePositive: null,
        },
      ];
    }
    return [];
  };

  const statCards = getStatCards();
  const scheduleData = analytics.charts?.weeklySchedule || [];
  const courseDistribution = analytics.charts?.courseDistribution || [];
  const monthlyActivity = analytics.charts?.monthlyActivity || [];
  const workloadData = analytics.charts?.workloadData || [];

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
          Welcome back, {user?.firstName}! Here's what's happening with your timetable system.
        </Typography>
      </Box>

      {/* Stat Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={statCards.length > 3 ? 2 : 4} key={index}>
            <Card
              sx={{
                background: isDark 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : 'white',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 2,
                height: '100%',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 16px ${alpha(card.color, 0.2)}`,
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1.5,
                      background: `linear-gradient(135deg, ${card.color} 0%, ${alpha(card.color, 0.7)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { fontSize: 24 } })}
                  </Box>
                  {card.change && (
                    <Chip
                      label={card.change}
                      size="small"
                      icon={card.changePositive ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: card.changePositive 
                          ? alpha('#10b981', 0.1)
                          : alpha('#ef4444', 0.1),
                        color: card.changePositive ? '#10b981' : '#ef4444',
                        '& .MuiChip-icon': {
                          color: card.changePositive ? '#10b981' : '#ef4444',
                        },
                      }}
                    />
                  )}
                </Box>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 0.5,
                    color: 'text.primary',
                  }}
                >
                  {card.value.toLocaleString()}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontWeight: 500, mb: 1.5 }}
                >
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Schedule Overview Chart */}
        {scheduleData.length > 0 && (
          <Grid item xs={12} lg={userRole === 'ADMIN' ? 8 : 12}>
            <Paper
              sx={{
                p: 3,
                background: isDark 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : 'white',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                {userRole === 'ADMIN' ? 'Schedule Overview' : 'Weekly Schedule'}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={scheduleData}>
                  <defs>
                    <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    {userRole === 'ADMIN' && (
                      <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    )}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '0.75rem' }}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '0.75rem' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? theme.palette.background.paper : 'white',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="classes"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorClasses)"
                    name="Classes"
                  />
                  {userRole === 'ADMIN' && (
                    <Area
                      type="monotone"
                      dataKey="registrations"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorRegistrations)"
                      name="Registrations"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Course/Workload Distribution Pie Chart */}
        {(courseDistribution.length > 0 || workloadData.length > 0) && (
          <Grid item xs={12} lg={userRole === 'ADMIN' ? 4 : 12}>
            <Paper
              sx={{
                p: 3,
                background: isDark 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : 'white',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                {userRole === 'STUDENT' ? 'Course Distribution' : userRole === 'LECTURER' ? 'Workload Distribution' : 'Course Distribution'}
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={courseDistribution.length > 0 ? courseDistribution : workloadData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(courseDistribution.length > 0 ? courseDistribution : workloadData).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: isDark ? theme.palette.background.paper : 'white',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: 8,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {(courseDistribution.length > 0 ? courseDistribution : workloadData).map((item: any, index: number) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color || COLORS[index % COLORS.length],
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Monthly Activity Chart (Admin Only) */}
      {userRole === 'ADMIN' && monthlyActivity.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                background: isDark 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : 'white',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Monthly Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '0.75rem' }}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: '0.75rem' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: isDark ? theme.palette.background.paper : 'white',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      borderRadius: 8,
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                  >
                    {monthlyActivity.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Dashboard;
