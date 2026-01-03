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
  LocationOn,
  Refresh,
  AdminPanelSettings,
  Person,
  Book,
  Assessment,
  Dashboard as DashboardIcon,
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
      try {
        const response = await api.get('/dashboard/analytics');
        return response.data;
      } catch (error: any) {
        // Handle 401 (unauthorized) gracefully
        if (error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user && authService.isAuthenticated(),
    refetchInterval: 60000, // Refetch every minute for real-time data
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
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
          icon: <LocationOn />,
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

  // Role-specific theme configurations
  const getRoleTheme = () => {
    if (userRole === 'ADMIN') {
      return {
        headerGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        primaryColor: '#1e293b',
        accentColor: '#475569',
        iconBg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        cardBorder: alpha('#1e293b', 0.2),
        headerIcon: <AdminPanelSettings />,
        welcomeText: 'System Administration Dashboard',
        subtitle: 'Monitor and manage the entire timetable system',
      };
    } else if (userRole === 'LECTURER') {
      return {
        headerGradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
        primaryColor: '#7c3aed',
        accentColor: '#a78bfa',
        iconBg: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
        cardBorder: alpha('#7c3aed', 0.2),
        headerIcon: <Book />,
        welcomeText: 'Lecturer Dashboard',
        subtitle: 'Manage your courses, sessions, and student attendance',
      };
    } else {
      return {
        headerGradient: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)',
        primaryColor: '#6366f1',
        accentColor: '#a5b4fc',
        iconBg: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        cardBorder: alpha('#6366f1', 0.2),
        headerIcon: <Person />,
        welcomeText: 'Student Dashboard',
        subtitle: 'View your classes, courses, and academic schedule',
      };
    }
  };

  const roleTheme = getRoleTheme();

  return (
    <Box>
      {/* Role-specific Header */}
      <Paper
        elevation={0}
        sx={{
          background: roleTheme.headerGradient,
          color: 'white',
          p: 4,
          mb: 4,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}
          >
            {React.cloneElement(roleTheme.headerIcon, { sx: { fontSize: 32, color: 'white' } })}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                mb: 0.5,
                color: 'white',
              }}
            >
              {roleTheme.welcomeText}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 400 }}>
              Welcome back, {user?.firstName}! {roleTheme.subtitle}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Next Class Widget - For Students and Lecturers - Prominent position at top */}
      {(userRole === 'STUDENT' || userRole === 'LECTURER') && (
        <Box sx={{ mb: 3 }}>
          <NextClassWidget />
        </Box>
      )}

      {/* Stat Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            lg={statCards.length > 3 ? 2 : 4} 
            key={index}
          >
            <Card
              sx={{
                background: isDark 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : 'white',
                border: `2px solid ${userRole === 'ADMIN' 
                  ? alpha('#1e293b', 0.1)
                  : userRole === 'LECTURER'
                  ? alpha('#7c3aed', 0.1)
                  : alpha('#6366f1', 0.1)}`,
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: userRole === 'ADMIN'
                    ? 'linear-gradient(90deg, #1e293b 0%, #334155 100%)'
                    : userRole === 'LECTURER'
                    ? 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)'
                    : 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateY(-4px) scale(1.02)',
                  boxShadow: userRole === 'ADMIN'
                    ? `0 12px 24px ${alpha('#1e293b', 0.25)}`
                    : userRole === 'LECTURER'
                    ? `0 12px 24px ${alpha('#7c3aed', 0.25)}`
                    : `0 12px 24px ${alpha('#6366f1', 0.25)}`,
                  borderColor: userRole === 'ADMIN'
                    ? alpha('#1e293b', 0.3)
                    : userRole === 'LECTURER'
                    ? alpha('#7c3aed', 0.3)
                    : alpha('#6366f1', 0.3),
                  '&::before': {
                    opacity: 1,
                  },
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
                      background: userRole === 'ADMIN'
                        ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
                        : userRole === 'LECTURER'
                        ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)'
                        : `linear-gradient(135deg, ${card.color} 0%, ${alpha(card.color, 0.7)} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: userRole === 'ADMIN'
                        ? `0 4px 12px ${alpha('#1e293b', 0.3)}`
                        : userRole === 'LECTURER'
                        ? `0 4px 12px ${alpha('#7c3aed', 0.3)}`
                        : `0 4px 12px ${alpha(card.color, 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { fontSize: 28 } })}
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
              elevation={0}
              sx={{
                p: 3,
                background: isDark 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : 'white',
                border: `2px solid ${userRole === 'ADMIN' 
                  ? alpha('#1e293b', 0.1)
                  : userRole === 'LECTURER'
                  ? alpha('#7c3aed', 0.1)
                  : alpha('#6366f1', 0.1)}`,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: userRole === 'ADMIN'
                    ? alpha('#1e293b', 0.3)
                    : userRole === 'LECTURER'
                    ? alpha('#7c3aed', 0.3)
                    : alpha('#6366f1', 0.3),
                  boxShadow: userRole === 'ADMIN'
                    ? `0 8px 16px ${alpha('#1e293b', 0.1)}`
                    : userRole === 'LECTURER'
                    ? `0 8px 16px ${alpha('#7c3aed', 0.1)}`
                    : `0 8px 16px ${alpha('#6366f1', 0.1)}`,
                },
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
              elevation={0}
              sx={{
                p: 3,
                background: isDark 
                  ? alpha(theme.palette.background.paper, 0.8)
                  : 'white',
                border: `2px solid ${alpha('#1e293b', 0.1)}`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: alpha('#1e293b', 0.3),
                  boxShadow: `0 8px 16px ${alpha('#1e293b', 0.1)}`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <Assessment sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Monthly Activity
                </Typography>
              </Box>
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
