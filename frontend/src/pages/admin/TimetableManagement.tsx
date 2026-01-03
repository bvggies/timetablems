import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  AutoAwesome as AutoAwesomeIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { format } from 'date-fns';

const TimetableManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    courseId: '',
    lecturerId: '',
    venueId: '',
    semesterId: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '11:00',
  });

  const [generateOptions, setGenerateOptions] = useState({
    semesterId: '',
    timeSlots: [
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
      { start: '14:00', end: '16:00' },
    ],
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['timetable', 'admin'],
    queryFn: async () => {
      const response = await api.get('/timetable');
      return response.data;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get('/courses');
      return response.data;
    },
  });

  const { data: venues } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const response = await api.get('/venues');
      return response.data;
    },
  });

  const { data: semesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const response = await api.get('/semesters');
      return response.data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const response = await api.get('/users', { params: { role: 'LECTURER' } });
        return response.data;
      } catch (error: any) {
        // Handle 403 (forbidden) gracefully
        if (error.response?.status === 403 || error.response?.status === 401) {
          return [];
        }
        throw error;
      }
    },
    enabled: authService.isAuthenticated(),
    retry: (failureCount, error: any) => {
      // Don't retry on 403/401 errors
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/timetable/sessions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setSessionDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      if (error.response?.data?.conflicts) {
        setConflicts(error.response.data.conflicts);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/timetable/sessions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setSessionDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      if (error.response?.data?.conflicts) {
        setConflicts(error.response.data.conflicts);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/timetable/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (options: any) => {
      const response = await api.post('/timetable/generate', options);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setGenerateDialogOpen(false);
      alert(`Generated ${data.sessionsCreated} sessions. ${data.conflicts.length} conflicts detected.`);
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (semesterId: string) => {
      const response = await api.post('/timetable/publish', { semesterId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      alert('Timetable published successfully!');
    },
  });

  const checkConflictsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/timetable/check-conflicts', data);
      return response.data;
    },
    onSuccess: (data) => {
      setConflicts(data.conflicts || []);
    },
  });

  const resetForm = () => {
    setFormData({
      courseId: '',
      lecturerId: '',
      venueId: '',
      semesterId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
    });
    setEditingSession(null);
    setConflicts([]);
  };

  const handleOpenSessionDialog = (session?: any) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        courseId: session.courseId,
        lecturerId: session.lecturerId,
        venueId: session.venueId,
        semesterId: session.semesterId,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
      });
    } else {
      resetForm();
    }
    setSessionDialogOpen(true);
  };

  const handleCheckConflicts = () => {
    checkConflictsMutation.mutate({
      ...formData,
      excludeSessionId: editingSession?.id,
    });
  };

  const handleSubmitSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const draftSessions = sessions?.filter((s: any) => s.status === 'DRAFT') || [];
  const publishedSessions = sessions?.filter((s: any) => s.status === 'PUBLISHED') || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Timetable Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => setGenerateDialogOpen(true)}
          >
            Auto-Generate
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenSessionDialog()}
          >
            Add Session
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Draft (${draftSessions.length})`} />
          <Tab label={`Published (${publishedSessions.length})`} />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Lecturer</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(tabValue === 0 ? draftSessions : publishedSessions).map((session: any) => (
              <TableRow key={session.id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {session.Course?.code || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {session.Course?.title || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {session.User?.firstName || ''} {session.User?.lastName || ''}
                </TableCell>
                <TableCell>{session.Venue?.name || 'N/A'}</TableCell>
                <TableCell>{days[session.dayOfWeek]}</TableCell>
                <TableCell>
                  {session.startTime} - {session.endTime}
                </TableCell>
                <TableCell>
                  <Chip
                    label={session.status}
                    size="small"
                    color={session.status === 'PUBLISHED' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpenSessionDialog(session)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (window.confirm('Delete this session?')) {
                        deleteMutation.mutate(session.id);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Session Dialog */}
      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmitSession}>
          <DialogTitle>
            {editingSession ? 'Edit Session' : 'Add New Session'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {editingSession ? 'Update the session details below.' : 'Fill out the form to create a new timetable session.'}
            </DialogContentText>
            {conflicts.length > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Conflicts Detected:
                </Typography>
                {conflicts.map((conflict, idx) => (
                  <Typography key={idx} variant="body2">
                    • {conflict.message}
                  </Typography>
                ))}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Course"
              select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              required
              margin="normal"
            >
              {courses?.map((course: any) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Lecturer"
              select
              value={formData.lecturerId}
              onChange={(e) => setFormData({ ...formData, lecturerId: e.target.value })}
              required
              margin="normal"
            >
              {users?.map((user: any) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Venue"
              select
              value={formData.venueId}
              onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
              required
              margin="normal"
            >
              {venues?.map((venue: any) => (
                <MenuItem key={venue.id} value={venue.id}>
                  {venue.name} (Capacity: {venue.capacity})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Day of Week"
              select
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
              required
              margin="normal"
            >
              {days.map((day, idx) => (
                <MenuItem key={idx} value={idx}>
                  {day}
                </MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Button
              variant="outlined"
              startIcon={<WarningIcon />}
              onClick={handleCheckConflicts}
              sx={{ mt: 2 }}
              disabled={!formData.courseId || !formData.lecturerId || !formData.venueId}
            >
              Check Conflicts
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={conflicts.length > 0}>
              {editingSession ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Auto-Generate Timetable</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Configure the options below to automatically generate a timetable for the selected semester.
          </DialogContentText>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will generate timetable sessions based on course allocations, lecturer availability, and venue capacity.
          </Alert>
          <TextField
            fullWidth
            label="Semester"
            select
            value={generateOptions.semesterId}
            onChange={(e) => setGenerateOptions({ ...generateOptions, semesterId: e.target.value })}
            required
            margin="normal"
          >
            {semesters?.map((semester: any) => (
              <MenuItem key={semester.id} value={semester.id}>
                {semester.year} {semester.term}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Time Slots
          </Typography>
          {generateOptions.timeSlots.map((slot, idx) => (
            <Grid container spacing={2} key={idx} sx={{ mb: 1 }}>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="Start"
                  type="time"
                  value={slot.start}
                  onChange={(e) => {
                    const newSlots = [...generateOptions.timeSlots];
                    newSlots[idx].start = e.target.value;
                    setGenerateOptions({ ...generateOptions, timeSlots: newSlots });
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  label="End"
                  type="time"
                  value={slot.end}
                  onChange={(e) => {
                    const newSlots = [...generateOptions.timeSlots];
                    newSlots[idx].end = e.target.value;
                    setGenerateOptions({ ...generateOptions, timeSlots: newSlots });
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  onClick={() => {
                    const newSlots = generateOptions.timeSlots.filter((_, i) => i !== idx);
                    setGenerateOptions({ ...generateOptions, timeSlots: newSlots });
                  }}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          ))}
          <Button
            onClick={() => {
              setGenerateOptions({
                ...generateOptions,
                timeSlots: [...generateOptions.timeSlots, { start: '08:00', end: '10:00' }],
              });
            }}
          >
            Add Time Slot
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => generateMutation.mutate(generateOptions)}
            disabled={generateMutation.isPending || !generateOptions.semesterId}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {draftSessions.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<PublishIcon />}
            onClick={() => {
              const semesterId = draftSessions[0]?.semesterId;
              if (semesterId) {
                publishMutation.mutate(semesterId);
              }
            }}
          >
            Publish Timetable ({draftSessions.length} sessions)
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default TimetableManagement;

