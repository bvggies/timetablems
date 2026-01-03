import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
} from '@mui/material';
import { Save, Notifications } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    timetableChanges: true,
    classReminders: true,
    announcements: true,
    digestFrequency: 'DAILY',
  });

  const { data: currentPreferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await api.get('/api/notification-preferences/preferences');
      return res.data;
    },
    onSuccess: (data) => {
      setPreferences({
        emailEnabled: data.emailEnabled,
        smsEnabled: data.smsEnabled,
        pushEnabled: data.pushEnabled,
        timetableChanges: data.timetableChanges,
        classReminders: data.classReminders,
        announcements: data.announcements,
        digestFrequency: data.digestFrequency,
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put('/api/notification-preferences/preferences', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  const handleSave = () => {
    updatePreferencesMutation.mutate(preferences);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Notifications sx={{ mr: 1 }} />
            <Typography variant="h6">Notification Preferences</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Notification Channels
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailEnabled}
                    onChange={(e) =>
                      setPreferences({ ...preferences, emailEnabled: e.target.checked })
                    }
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.smsEnabled}
                    onChange={(e) =>
                      setPreferences({ ...preferences, smsEnabled: e.target.checked })
                    }
                  />
                }
                label="SMS Notifications"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.pushEnabled}
                    onChange={(e) =>
                      setPreferences({ ...preferences, pushEnabled: e.target.checked })
                    }
                  />
                }
                label="Push Notifications"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Notification Types
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.timetableChanges}
                    onChange={(e) =>
                      setPreferences({ ...preferences, timetableChanges: e.target.checked })
                    }
                  />
                }
                label="Timetable Changes"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.classReminders}
                    onChange={(e) =>
                      setPreferences({ ...preferences, classReminders: e.target.checked })
                    }
                  />
                }
                label="Class Reminders"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.announcements}
                    onChange={(e) =>
                      setPreferences({ ...preferences, announcements: e.target.checked })
                    }
                  />
                }
                label="Announcements"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControl fullWidth>
                <InputLabel>Digest Frequency</InputLabel>
                <Select
                  value={preferences.digestFrequency}
                  onChange={(e) =>
                    setPreferences({ ...preferences, digestFrequency: e.target.value })
                  }
                >
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="NEVER">Never</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                sx={{ mt: 2 }}
              >
                Save Preferences
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;

