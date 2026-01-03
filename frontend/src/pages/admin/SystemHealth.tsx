import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import { CheckCircle, Error, Memory, Storage } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import ModernTable from '../../components/ModernTable';

const SystemHealth: React.FC = () => {
  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await api.get('/api/admin/health');
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: stats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const res = await api.get('/api/admin/stats');
      return res.data;
    },
  });

  const { data: activity } = useQuery({
    queryKey: ['system-activity'],
    queryFn: async () => {
      const res = await api.get('/api/admin/activity', { params: { limit: 50 } });
      return res.data;
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Health & Monitoring
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Database</Typography>
                  <Chip
                    icon={health?.database === 'healthy' ? <CheckCircle /> : <Error />}
                    label={health?.database || 'Unknown'}
                    color={health?.database === 'healthy' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Uptime</Typography>
                  <Typography variant="body2">
                    {health?.uptime ? `${Math.floor(health.uptime / 60)} minutes` : 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Memory Usage
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      health?.memory
                        ? (health.memory.used / health.memory.total) * 100
                        : 0
                    }
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {health?.memory?.used}MB / {health?.memory?.total}MB
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Statistics
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {stats?.users?.total || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {stats?.academic?.courses || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Courses
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {stats?.academic?.sessions || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sessions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h4" color="primary">
                      {stats?.activity?.last24Hours || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activity (24h)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <ModernTable
                data={activity || []}
                columns={[
                  {
                    id: 'action',
                    label: 'Action',
                    render: (row: any) => row.action,
                  },
                  {
                    id: 'entity',
                    label: 'Entity',
                    render: (row: any) => row.entity,
                  },
                  {
                    id: 'user',
                    label: 'User',
                    render: (row: any) =>
                      row.User
                        ? `${row.User.firstName} ${row.User.lastName}`
                        : 'System',
                  },
                  {
                    id: 'timestamp',
                    label: 'Timestamp',
                    render: (row: any) => new Date(row.createdAt).toLocaleString(),
                  },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SystemHealth;

