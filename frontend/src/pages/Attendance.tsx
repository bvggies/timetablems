import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  AccessTime,
  Block,
  Save,
  Edit,
  History,
  Analytics,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import ModernTable from '../components/ModernTable';

const Attendance: React.FC = () => {
  const user = authService.getStoredUser();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editingAttendance, setEditingAttendance] = useState<any>(null);

  // Fetch sessions for lecturer/admin
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['lecturer-sessions'],
    queryFn: async () => {
      const res = await api.get('/timetable', {
        params: user?.role === 'LECTURER' ? { lecturerId: user?.id } : {},
      });
      return res.data;
    },
    enabled: user?.role === 'LECTURER' || user?.role === 'ADMIN',
  });

  // Fetch students for selected session
  const { data: sessionStudents, isLoading: studentsLoading } = useQuery({
    queryKey: ['session-students', selectedSession?.id],
    queryFn: async () => {
      const res = await api.get(`/attendance/sessions/${selectedSession?.id}/students`);
      return res.data;
    },
    enabled: !!selectedSession && (user?.role === 'LECTURER' || user?.role === 'ADMIN'),
  });

  // Fetch attendance history
  const { data: attendanceHistory } = useQuery({
    queryKey: ['attendance-history'],
    queryFn: async () => {
      const res = await api.get('/attendance/history');
      return res.data;
    },
    enabled: user?.role === 'LECTURER' || user?.role === 'ADMIN',
  });

  // Fetch attendance analytics
  const { data: analytics } = useQuery({
    queryKey: ['attendance-analytics'],
    queryFn: async () => {
      const res = await api.get('/attendance/analytics');
      return res.data;
    },
    enabled: user?.role === 'LECTURER' || user?.role === 'ADMIN',
  });

  // Fetch student's attendance
  const { data: studentAttendance } = useQuery({
    queryKey: ['student-attendance', user?.id],
    queryFn: async () => {
      const res = await api.get(`/attendance/students/${user?.id}/attendance`);
      return res.data;
    },
    enabled: user?.role === 'STUDENT',
  });

  const bulkMarkMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/attendance/sessions/${selectedSession.id}/attendance/bulk`, {
        attendanceList: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['session-students'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-analytics'] });
      setAttendanceDialog(false);
      setSelectedSession(null);
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await api.put(`/attendance/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-analytics'] });
      setEditingAttendance(null);
    },
  });

  const handleMarkAttendance = (session: any) => {
    setSelectedSession(session);
    setAttendanceDialog(true);
  };

  const handleSaveAttendance = () => {
    const attendanceData = attendanceList.map((student) => ({
      studentId: student.studentId,
      status: student.status || 'PRESENT',
      notes: student.notes || '',
    }));
    bulkMarkMutation.mutate(attendanceData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'success';
      case 'ABSENT':
        return 'error';
      case 'LATE':
        return 'warning';
      case 'EXCUSED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle />;
      case 'ABSENT':
        return <Cancel />;
      case 'LATE':
        return <AccessTime />;
      case 'EXCUSED':
        return <Block />;
      default:
        return undefined;
    }
  };

  // Initialize attendance list when session students are loaded
  React.useEffect(() => {
    if (sessionStudents?.students && attendanceList.length === 0) {
      const initialList = sessionStudents.students.map((student: any) => ({
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        pugId: student.pugId,
        status: student.attendance?.status || 'PRESENT',
        notes: student.attendance?.notes || '',
        attendanceId: student.attendance?.id,
      }));
      setAttendanceList(initialList);
    }
  }, [sessionStudents, attendanceList.length]);

  if (user?.role === 'STUDENT') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Attendance
        </Typography>
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <ModernTable
              data={studentAttendance || []}
              columns={[
                {
                  id: 'course',
                  label: 'Course',
                  render: (row: any) => row.TimetableSession?.Course?.code || 'N/A',
                },
                {
                  id: 'date',
                  label: 'Date',
                  render: (row: any) => new Date(row.markedAt).toLocaleDateString(),
                },
                {
                  id: 'status',
                  label: 'Status',
                  render: (row: any) => {
                    const icon = getStatusIcon(row.status);
                    return (
                      <Chip
                        {...(icon && { icon })}
                        label={row.status}
                        color={getStatusColor(row.status) as any}
                        size="small"
                      />
                    );
                  },
                },
                {
                  id: 'notes',
                  label: 'Notes',
                  render: (row: any) => row.notes || '-',
                },
              ]}
            />
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Management
      </Typography>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<CheckCircle />} label="Mark Attendance" />
        <Tab icon={<History />} label="History" />
        <Tab icon={<Analytics />} label="Analytics" />
      </Tabs>

      {tabValue === 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              My Sessions
            </Typography>
            {isLoading ? (
              <Typography>Loading...</Typography>
            ) : (
              <ModernTable
                data={sessions || []}
                columns={[
                  {
                    id: 'course',
                    label: 'Course',
                    render: (row: any) => row.Course?.code || 'N/A',
                  },
                  {
                    id: 'day',
                    label: 'Day',
                    render: (row: any) => {
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      return days[row.dayOfWeek] || 'N/A';
                    },
                  },
                  {
                    id: 'time',
                    label: 'Time',
                    render: (row: any) => `${row.startTime} - ${row.endTime}`,
                  },
                  {
                    id: 'venue',
                    label: 'Venue',
                    render: (row: any) => row.Venue?.name || 'N/A',
                  },
                  {
                    id: 'actions',
                    label: 'Actions',
                    render: (row: any) => (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleMarkAttendance(row)}
                      >
                        Mark Attendance
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </CardContent>
        </Card>
      )}

      {tabValue === 1 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Attendance History
            </Typography>
            <ModernTable
              data={attendanceHistory || []}
              columns={[
                {
                  id: 'student',
                  label: 'Student',
                  render: (row: any) => `${row.Student?.firstName} ${row.Student?.lastName} (${row.Student?.pugId})`,
                },
                {
                  id: 'course',
                  label: 'Course',
                  render: (row: any) => row.TimetableSession?.Course?.code || 'N/A',
                },
                {
                  id: 'date',
                  label: 'Date',
                  render: (row: any) => new Date(row.markedAt).toLocaleDateString(),
                },
                {
                  id: 'status',
                  label: 'Status',
                  render: (row: any) => {
                    const icon = getStatusIcon(row.status);
                    return (
                      <Chip
                        {...(icon && { icon })}
                        label={row.status}
                        color={getStatusColor(row.status) as any}
                        size="small"
                      />
                    );
                  },
                },
                {
                  id: 'markedBy',
                  label: 'Marked By',
                  render: (row: any) => `${row.Marker?.firstName} ${row.Marker?.lastName}`,
                },
                {
                  id: 'notes',
                  label: 'Notes',
                  render: (row: any) => row.notes || '-',
                },
                ...(user?.role === 'ADMIN'
                  ? [
                      {
                        id: 'actions',
                        label: 'Actions',
                        render: (row: any) => (
                          <IconButton
                            size="small"
                            onClick={() => setEditingAttendance(row)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        ),
                      },
                    ]
                  : []),
              ]}
            />
          </CardContent>
        </Card>
      )}

      {tabValue === 2 && analytics && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Total Records</Typography>
                <Typography variant="h4">{analytics.totalRecords}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Attendance Rate</Typography>
                <Typography variant="h4">{analytics.attendanceRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Status Breakdown</Typography>
                {analytics.statusBreakdown?.map((stat: any) => (
                  <Box key={stat.status} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography>{stat.status}</Typography>
                    <Typography>
                      {stat.count} ({stat.percentage}%)
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  By Course
                </Typography>
                <ModernTable
                  data={analytics.courseStats || []}
                  columns={[
                    {
                      id: 'course',
                      label: 'Course',
                      render: (row: any) => `${row.course.code} - ${row.course.title}`,
                    },
                    {
                      id: 'total',
                      label: 'Total',
                      render: (row: any) => row.total,
                    },
                    {
                      id: 'present',
                      label: 'Present',
                      render: (row: any) => row.present,
                    },
                    {
                      id: 'absent',
                      label: 'Absent',
                      render: (row: any) => row.absent,
                    },
                    {
                      id: 'late',
                      label: 'Late',
                      render: (row: any) => row.late,
                    },
                    {
                      id: 'excused',
                      label: 'Excused',
                      render: (row: any) => row.excused,
                    },
                    {
                      id: 'rate',
                      label: 'Rate',
                      render: (row: any) =>
                        row.total > 0 ? `${Math.round((row.present / row.total) * 100)}%` : '0%',
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Mark Attendance Dialog */}
      <Dialog open={attendanceDialog} onClose={() => {
        setAttendanceDialog(false);
        setSelectedSession(null);
        setAttendanceList([]);
      }} maxWidth="md" fullWidth>
        <DialogTitle>
          Mark Attendance - {selectedSession?.Course?.code}
        </DialogTitle>
        <DialogContent>
          {sessionStudents && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {sessionStudents.session?.Venue?.name || 'TBA'} • {sessionStudents.session?.startTime} - {sessionStudents.session?.endTime}
              </Typography>
              {studentsLoading ? (
                <Typography>Loading students...</Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {attendanceList.map((student, index) => (
                    <Box
                      key={student.studentId}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        p: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1">
                          {student.firstName} {student.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.pugId}
                        </Typography>
                      </Box>
                      <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={student.status}
                          label="Status"
                          onChange={(e) => {
                            const updated = [...attendanceList];
                            updated[index].status = e.target.value;
                            setAttendanceList(updated);
                          }}
                        >
                          <MenuItem value="PRESENT">Present</MenuItem>
                          <MenuItem value="ABSENT">Absent</MenuItem>
                          <MenuItem value="LATE">Late</MenuItem>
                          <MenuItem value="EXCUSED">Excused</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        placeholder="Notes"
                        value={student.notes || ''}
                        onChange={(e) => {
                          const updated = [...attendanceList];
                          updated[index].notes = e.target.value;
                          setAttendanceList(updated);
                        }}
                        sx={{ minWidth: 150 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAttendanceDialog(false);
            setSelectedSession(null);
            setAttendanceList([]);
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveAttendance}
            disabled={bulkMarkMutation.isPending || attendanceList.length === 0}
          >
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Attendance Dialog (Admin only) */}
      {user?.role === 'ADMIN' && editingAttendance && (
        <Dialog open={!!editingAttendance} onClose={() => setEditingAttendance(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Attendance</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Student: {editingAttendance.Student?.firstName} {editingAttendance.Student?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Course: {editingAttendance.TimetableSession?.Course?.code}
              </Typography>
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingAttendance.status}
                  label="Status"
                  onChange={(e) =>
                    setEditingAttendance({ ...editingAttendance, status: e.target.value })
                  }
                >
                  <MenuItem value="PRESENT">Present</MenuItem>
                  <MenuItem value="ABSENT">Absent</MenuItem>
                  <MenuItem value="LATE">Late</MenuItem>
                  <MenuItem value="EXCUSED">Excused</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={editingAttendance.notes || ''}
                onChange={(e) =>
                  setEditingAttendance({ ...editingAttendance, notes: e.target.value })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingAttendance(null)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                updateAttendanceMutation.mutate({
                  id: editingAttendance.id,
                  data: {
                    status: editingAttendance.status,
                    notes: editingAttendance.notes,
                  },
                });
              }}
              disabled={updateAttendanceMutation.isPending}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Attendance;
