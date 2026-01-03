import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
} from '@mui/material';
import { Add, Announcement } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import ModernTable from '../components/ModernTable';

const Announcements: React.FC = () => {
  const user = authService.getStoredUser();
  const queryClient = useQueryClient();
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    scope: 'ALL',
    departmentId: '',
    levelId: '',
  });

  const { data: announcements } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const res = await api.get('/announcements');
      return res.data;
    },
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data;
    },
  });

  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const res = await api.get('/levels');
      return res.data;
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/announcements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setAnnouncementDialog(false);
      setFormData({
        title: '',
        message: '',
        scope: 'ALL',
        departmentId: '',
        levelId: '',
      });
    },
  });

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'ALL':
        return 'primary';
      case 'DEPARTMENT':
        return 'secondary';
      case 'LEVEL':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Announcements</Typography>
        {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAnnouncementDialog(true)}
          >
            Create Announcement
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {announcements?.map((announcement: any) => (
          <Grid item xs={12} key={announcement.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6">{announcement.title}</Typography>
                  <Chip
                    label={announcement.scope}
                    color={getScopeColor(announcement.scope) as any}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {announcement.message}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {announcement.Department && (
                    <Chip label={announcement.Department.name} size="small" />
                  )}
                  {announcement.Level && (
                    <Chip label={announcement.Level.name} size="small" />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={announcementDialog} onClose={() => setAnnouncementDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Scope</InputLabel>
                <Select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                >
                  <MenuItem value="ALL">All Users</MenuItem>
                  <MenuItem value="DEPARTMENT">Department</MenuItem>
                  <MenuItem value="LEVEL">Level</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {formData.scope === 'DEPARTMENT' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  >
                    {departments?.map((dept: any) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {formData.scope === 'LEVEL' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={formData.levelId}
                    onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                  >
                    {levels?.map((level: any) => (
                      <MenuItem key={level.id} value={level.id}>
                        {level.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnnouncementDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createAnnouncementMutation.mutate(formData)}
          >
            Create Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Announcements;

