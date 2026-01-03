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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';

const StudentCourseRegistration: React.FC = () => {
  const queryClient = useQueryClient();
  const user = authService.getStoredUser();
  const [tabValue, setTabValue] = useState(0);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState('');

  const { data: availableCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', 'available'],
    queryFn: async () => {
      const response = await api.get('/courses');
      return response.data;
    },
  });

  const { data: myRegistrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['student-registrations'],
    queryFn: async () => {
      const response = await api.get('/registrations');
      return response.data;
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ courseId, semesterId }: { courseId: string; semesterId: string }) => {
      const response = await api.post('/registrations', {
        courseId,
        semesterId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setRegisterDialogOpen(false);
    },
  });

  const dropMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      await api.delete(`/registrations/${registrationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    },
  });

  const handleRegister = (course: any) => {
    setSelectedCourse(course);
    setRegisterDialogOpen(true);
  };

  const handleSubmitRegistration = () => {
    if (selectedCourse && selectedSemester) {
      registerMutation.mutate({
        courseId: selectedCourse.id,
        semesterId: selectedSemester,
      });
    }
  };

  // Filter courses based on student's department and level
  const filteredCourses = availableCourses?.filter((course: any) => {
    if (!user) return false;
    // In a real implementation, you'd check department and level matching
    return true;
  });

  const registeredCourseIds = myRegistrations?.map((r: any) => r.courseId) || [];

  if (coursesLoading || registrationsLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Course Registration
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Register for courses in the current semester
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Available Courses (${filteredCourses?.length || 0})`} />
          <Tab label={`My Registrations (${myRegistrations?.length || 0})`} />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses?.map((course: any) => {
                const isRegistered = registeredCourseIds.includes(course.id);
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Chip label={course.code} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>{course.credits}</TableCell>
                    <TableCell>{course.department?.name || 'N/A'}</TableCell>
                    <TableCell>{course.level?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {isRegistered ? (
                        <Chip label="Registered" color="success" size="small" icon={<CheckCircle />} />
                      ) : (
                        <Chip label="Available" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {isRegistered ? (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => {
                            const registration = myRegistrations?.find((r: any) => r.courseId === course.id);
                            if (registration && window.confirm('Drop this course?')) {
                              dropMutation.mutate(registration.id);
                            }
                          }}
                        >
                          Drop
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleRegister(course)}
                        >
                          Register
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Registered Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myRegistrations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      No registered courses. Register for courses in the Available Courses tab.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                myRegistrations?.map((registration: any) => (
                  <TableRow key={registration.id}>
                    <TableCell>
                      <Chip label={registration.course.code} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{registration.course.title}</TableCell>
                    <TableCell>{registration.course.credits}</TableCell>
                    <TableCell>
                      {new Date(registration.registeredAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => {
                          if (window.confirm('Drop this course?')) {
                            dropMutation.mutate(registration.id);
                          }
                        }}
                      >
                        Drop
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Registration Dialog */}
      <Dialog open={registerDialogOpen} onClose={() => setRegisterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register for Course</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a semester to register for the selected course.
          </DialogContentText>
          {selectedCourse && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedCourse.code} - {selectedCourse.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Credits: {selectedCourse.credits}
              </Typography>
              <TextField
                fullWidth
                label="Semester"
                select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                required
                margin="normal"
              >
                {/* Semesters would be loaded here */}
                <MenuItem value="current">Current Semester</MenuItem>
              </TextField>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegisterDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitRegistration}
            disabled={!selectedSemester || registerMutation.isPending}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentCourseRegistration;

