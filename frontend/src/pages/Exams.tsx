import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Grid,
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
import { format } from 'date-fns';

const Exams: React.FC = () => {
  const queryClient = useQueryClient();
  const user = authService.getStoredUser();
  const isAdmin = user?.role === 'ADMIN';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    courseId: '',
    venueId: '',
    semesterId: '',
    date: '',
    startTime: '09:00',
    endTime: '11:00',
    notes: '',
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const response = await api.get('/exams');
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

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/exams', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setDialogOpen(false);
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
      const response = await api.put(`/exams/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setDialogOpen(false);
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
      await api.delete(`/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });

  const checkConflictsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/exams/check-conflicts', data);
      return response.data;
    },
    onSuccess: (data) => {
      setConflicts(data.conflicts || []);
    },
  });

  const resetForm = () => {
    setFormData({
      courseId: '',
      venueId: '',
      semesterId: '',
      date: '',
      startTime: '09:00',
      endTime: '11:00',
      notes: '',
    });
    setEditingExam(null);
    setConflicts([]);
  };

  const handleOpen = (exam?: any) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        courseId: exam.courseId,
        venueId: exam.venueId,
        semesterId: exam.semesterId,
        date: format(new Date(exam.date), 'yyyy-MM-dd'),
        startTime: exam.startTime,
        endTime: exam.endTime,
        notes: exam.notes || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCheckConflicts = () => {
    checkConflictsMutation.mutate({
      ...formData,
      excludeExamId: editingExam?.id,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      date: new Date(formData.date),
    };
    if (editingExam) {
      updateMutation.mutate({ id: editingExam.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Group exams by date
  const examsByDate = exams?.reduce((acc: any, exam: any) => {
    const dateKey = format(new Date(exam.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(exam);
    return acc;
  }, {}) || {};

  if (isLoading) {
    return <Typography>Loading exams...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Exam Timetable</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Exam
          </Button>
        )}
      </Box>

      {Object.keys(examsByDate).length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No exams scheduled</Typography>
        </Paper>
      ) : (
        Object.keys(examsByDate)
          .sort()
          .map((dateKey) => (
            <Paper key={dateKey} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Course</TableCell>
                      <TableCell>Venue</TableCell>
                      {isAdmin && <TableCell>Actions</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examsByDate[dateKey].map((exam: any) => (
                      <TableRow key={exam.id}>
                        <TableCell>
                          {exam.startTime} - {exam.endTime}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {exam.course.code}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {exam.course.title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{exam.venue.name}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            <IconButton size="small" onClick={() => handleOpen(exam)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => {
                                if (window.confirm('Delete this exam?')) {
                                  deleteMutation.mutate(exam.id);
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))
      )}

      {/* Exam Dialog */}
      {isAdmin && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingExam ? 'Edit Exam' : 'Add New Exam'}
            </DialogTitle>
            <DialogContent>
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
                label="Semester"
                select
                value={formData.semesterId}
                onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                required
                margin="normal"
              >
                {semesters?.map((semester: any) => (
                  <MenuItem key={semester.id} value={semester.id}>
                    {semester.year} {semester.term}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    margin="normal"
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
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={3}
                margin="normal"
              />
              <Button
                variant="outlined"
                startIcon={<WarningIcon />}
                onClick={handleCheckConflicts}
                sx={{ mt: 2 }}
                disabled={!formData.courseId || !formData.venueId || !formData.date}
              >
                Check Conflicts
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={conflicts.length > 0}>
                {editingExam ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default Exams;

