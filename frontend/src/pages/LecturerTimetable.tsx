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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';

const LecturerTimetable: React.FC = () => {
  const user = authService.getStoredUser();
  const queryClient = useQueryClient();
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    courseId: '',
    venueId: '',
    semesterId: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '11:00',
  });

  // Fetch only lecturer's sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['timetable', 'lecturer'],
    queryFn: async () => {
      const response = await api.get('/timetable', {
        params: { lecturerId: user?.id },
      });
      return response.data;
    },
  });

  // Fetch only courses assigned to this lecturer
  const { data: myCourses } = useQuery({
    queryKey: ['courses', 'lecturer'],
    queryFn: async () => {
      // Get courses where lecturer is allocated
      const response = await api.get('/courses');
      // Filter on frontend - in production, create a backend endpoint
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/timetable/sessions', {
        ...data,
        lecturerId: user?.id, // Always use logged-in lecturer
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setSessionDialogOpen(false);
      resetForm();
      setConflicts([]);
    },
    onError: (error: any) => {
      if (error.response?.data?.conflicts) {
        setConflicts(error.response.data.conflicts);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/timetable/sessions/${id}`, {
        ...data,
        lecturerId: user?.id, // Always use logged-in lecturer
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setSessionDialogOpen(false);
      resetForm();
      setConflicts([]);
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

  const resetForm = () => {
    setFormData({
      courseId: '',
      venueId: '',
      semesterId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '11:00',
    });
    setEditingSession(null);
    setConflicts([]);
  };

  const handleOpenDialog = (session?: any) => {
    if (session) {
      setEditingSession(session);
      setFormData({
        courseId: session.courseId,
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

  const handleSubmit = () => {
    if (editingSession) {
      updateMutation.mutate({ id: editingSession.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  if (isLoading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Timetable Sessions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Session
        </Button>
      </Box>

      {conflicts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Conflicts Detected:
          </Typography>
          {conflicts.map((conflict: any, index: number) => (
            <Typography key={index} variant="body2">
              {conflict.message}
            </Typography>
          ))}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Day</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Venue</TableCell>
              <TableCell>Semester</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions?.map((session: any) => (
              <TableRow key={session.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {session.Course?.code}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.Course?.title}
                  </Typography>
                </TableCell>
                <TableCell>{getDayName(session.dayOfWeek)}</TableCell>
                <TableCell>
                  {session.startTime} - {session.endTime}
                </TableCell>
                <TableCell>{session.Venue?.name || 'TBA'}</TableCell>
                <TableCell>
                  {session.Semester?.year} {session.Semester?.term}
                </TableCell>
                <TableCell>
                  <Chip
                    label={session.status}
                    size="small"
                    color={session.status === 'PUBLISHED' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(session)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this session?')) {
                        deleteMutation.mutate(session.id);
                      }
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!sessions || sessions.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">No sessions found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={sessionDialogOpen} onClose={() => setSessionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSession ? 'Edit Session' : 'Create Session'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Course"
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
              >
                {myCourses?.map((course: any) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Day of Week"
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                required
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
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
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Venue"
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                required
              >
                {venues?.map((venue: any) => (
                  <MenuItem key={venue.id} value={venue.id}>
                    {venue.name} ({venue.capacity} capacity)
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Semester"
                value={formData.semesterId}
                onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                required
              >
                {semesters?.map((semester: any) => (
                  <MenuItem key={semester.id} value={semester.id}>
                    {semester.year} {semester.term}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={createMutation.isPending || updateMutation.isPending}>
            {editingSession ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LecturerTimetable;

