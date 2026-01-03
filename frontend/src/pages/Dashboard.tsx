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
} from '@mui/material';
import { 
  CalendarToday, 
  School, 
  People, 
  Notifications,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AttachMoney,
  PersonAdd,
  Folder,
  Videocam,
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

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const user = authService.getStoredUser();
  const isDark = theme.palette.mode === 'dark';

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      return {
        upcomingClasses: 3,
        registeredCourses: 5,
        notifications: 4,
        totalStudents: 1200,
        totalLecturers: 45,
        totalVenues: 28,
      };
    },
  });

  // Sample chart data
  const scheduleData = [
    { name: 'Mo', classes: 12, registrations: 8 },
    { name: 'Tu', classes: 19, registrations: 15 },
    { name: 'We', classes: 15, registrations: 12 },
    { name: 'Th', classes: 22, registrations: 18 },
    { name: 'Fr', classes: 18, registrations: 14 },
    { name: 'Sa', classes: 10, registrations: 6 },
    { name: 'Su', classes: 5, registrations: 3 },
  ];

  const monthlyData = [
    { name: 'Jan', value: 12 },
    { name: 'Feb', value: 19 },
    { name: 'Mar', value: 15 },
    { name: 'Apr', value: 22 },
    { name: 'May', value: 18 },
    { name: 'Jun', value: 24 },
  ];

  const courseDistribution = [
    { name: 'Active', value: 30, color: '#10b981' },
    { name: 'Pending', value: 20, color: '#ef4444' },
    { name: 'Completed', value: 15, color: '#3b82f6' },
  ];

  const statCards = [
    {
      title: 'Total Classes',
      value: '8,052',
      icon: <CalendarToday />,
      color: '#6366f1',
      change: '+25%',
      changePositive: true,
      miniChart: [12, 19, 15, 22, 18, 24, 20],
    },
    {
      title: 'Total Revenue',
      value: '$6.2K',
      icon: <AttachMoney />,
      color: '#10b981',
      change: '+15%',
      changePositive: true,
      miniChart: [8, 12, 10, 15, 14, 18, 16],
    },
    {
      title: 'New Students',
      value: '1.3K',
      icon: <PersonAdd />,
      color: '#f59e0b',
      change: '-10%',
      changePositive: false,
      miniChart: [15, 18, 16, 20, 17, 22, 19],
    },
    {
      title: 'Active Courses',
      value: '956',
      icon: <Folder />,
      color: '#ec4899',
      change: '-14%',
      changePositive: false,
      miniChart: [20, 18, 22, 16, 19, 15, 17],
    },
    {
      title: 'Total Students',
      value: '10M',
      icon: <People />,
      color: '#3b82f6',
      change: '+8%',
      changePositive: true,
    },
    {
      title: 'Notifications',
      value: '170',
      icon: <Refresh />,
      color: '#8b5cf6',
      change: '+5%',
      changePositive: true,
    },
  ];

  const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

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
          <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
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
                </Box>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 0.5,
                    color: 'text.primary',
                  }}
                >
                  {card.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontWeight: 500, mb: 1.5 }}
                >
                  {card.title}
                </Typography>
                
                {card.miniChart && (
                  <Box sx={{ height: 40, mt: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={card.miniChart.map((val, i) => ({ value: val, index: i }))}>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={card.color}
                          fill={card.color}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Schedule Overview Chart */}
        <Grid item xs={12} lg={8}>
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
              Schedule Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={scheduleData}>
                <defs>
                  <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
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
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRegistrations)"
                  name="Registrations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Course Distribution Pie Chart */}
        <Grid item xs={12} lg={4}>
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
              Course Distribution
            </Typography>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {courseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
              {courseDistribution.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: item.color,
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
      </Grid>

      {/* Monthly Activity Chart */}
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
              <BarChart data={monthlyData}>
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
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 10}, 70%, ${isDark ? '60%' : '50%'})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
