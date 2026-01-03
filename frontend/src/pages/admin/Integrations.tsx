import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Sync, Settings, CheckCircle, Cancel } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const Integrations: React.FC = () => {
  const queryClient = useQueryClient();
  const [configDialog, setConfigDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<'lms' | 'sis' | null>(null);
  const [config, setConfig] = useState({ apiKey: '', apiUrl: '' });

  const { data: status } = useQuery({
    queryKey: ['integration-status'],
    queryFn: async () => {
      const res = await api.get('/api/integrations/status');
      return res.data;
    },
  });

  const syncLMSMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/integrations/lms/sync', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-status'] });
    },
  });

  const syncSISMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/integrations/sis/sync', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-status'] });
    },
  });

  const configureMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/api/integrations/configure', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-status'] });
      setConfigDialog(false);
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Integrations
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">LMS Integration</Typography>
                <Chip
                  icon={status?.lms?.enabled ? <CheckCircle /> : <Cancel />}
                  label={status?.lms?.status || 'Not Configured'}
                  color={status?.lms?.enabled ? 'success' : 'default'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sync courses, students, and enrollments with your Learning Management System.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => {
                    setSelectedType('lms');
                    setConfigDialog(true);
                  }}
                >
                  Configure
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Sync />}
                  onClick={() => syncLMSMutation.mutate({ syncType: 'courses' })}
                  disabled={!status?.lms?.enabled}
                >
                  Sync Now
                </Button>
              </Box>
              {status?.lms?.lastSync && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Last sync: {new Date(status.lms.lastSync).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">SIS Integration</Typography>
                <Chip
                  icon={status?.sis?.enabled ? <CheckCircle /> : <Cancel />}
                  label={status?.sis?.status || 'Not Configured'}
                  color={status?.sis?.enabled ? 'success' : 'default'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sync users, courses, and departments with your Student Information System.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => {
                    setSelectedType('sis');
                    setConfigDialog(true);
                  }}
                >
                  Configure
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Sync />}
                  onClick={() => syncSISMutation.mutate({ syncType: 'users' })}
                  disabled={!status?.sis?.enabled}
                >
                  Sync Now
                </Button>
              </Box>
              {status?.sis?.lastSync && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Last sync: {new Date(status.sis.lastSync).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configure {selectedType?.toUpperCase()} Integration</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="API URL"
            value={config.apiUrl}
            onChange={(e) => setConfig({ ...config, apiUrl: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="API Key"
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              configureMutation.mutate({
                type: selectedType,
                config,
              });
            }}
          >
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Integrations;


