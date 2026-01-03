import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  AccessTime,
  Block,
  Edit,
  Save,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../store/authStore';
import ModernTable from '../components/ModernTable';

const Attendance: React.FC = () => {
  const user = authService.getStoredUser();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [attendanceDialog, setAttendanceDialog] = useState(false);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  // Fetch sessions for lecturer
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['lecturer-sessions'],
    queryFn: async () => {
      const res = await api.get('/api/timetable', {
        params: { lecturerId: user?.id },
      });
      return res.data;
    },
    enabled: user?.role === 'LECTURER' || user?.role === 'ADMIN',
  });

  // Fetch attendance for selected session
  const { data: attendance } = useQuery({
    queryKey: ['attendance', selectedSession?.id],
    queryFn: async () => {
      const res = await api.get(`/api/attendance/sessions/${selectedSession?.id}/attendance`);
      return res.data;
    },
    enabled: !!selectedSession,
  });

  // Fetch student's attendance
  const { data: studentAttendance } = useQuery({
    queryKey: ['student-attendance', user?.id],
    queryFn: async () => {
      const res = await api.get(`/api/attendance/students/${user?.id}/attendance`);
      return res.data;
    },
    enabled: user?.role === 'STUDENT',
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/api/attendance/sessions/${selectedSession.id}/attendance`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setAttendanceDialog(false);
    },
  });

  const bulkMarkMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/api/attendance/sessions/${selectedSession.id}/attendance/bulk`, {
        attendanceList: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      setAttendanceDialog(false);
    },
  });

  const handleMarkAttendance = (session: any) => {
    setSelectedSession(session);
    setAttendanceDialog(true);
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
        return null;
    }
  };

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
                  render: (row: any) => (
                    <Chip
                      icon={getStatusIcon(row.status)}
                      label={row.status}
                      color={getStatusColor(row.status) as any}
                      size="small"
                    />
                  ),
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

      <Dialog open={attendanceDialog} onClose={() => setAttendanceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Mark Attendance - {selectedSession?.Course?.code}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedSession?.Venue?.name} • {selectedSession?.startTime} - {selectedSession?.endTime}
          </Typography>
          <Box sx={{ mt: 2 }}>
            {attendance?.map((record: any) => (
              <Box key={record.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">
                    {record.Student?.firstName} {record.Student?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {record.Student?.pugId}
                  </Typography>
                </Box>
                <FormControl size="small" sx={{ minWidth: 120, mr: 1 }}>
                  <Select
                    value={record.status}
                    onChange={(e) => {
                      const updated = attendance.map((a: any) =>
                        a.id === record.id ? { ...a, status: e.target.value } : a
                      );
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
                  value={record.notes || ''}
                  onChange={(e) => {
                    const updated = attendance.map((a: any) =>
                      a.id === record.id ? { ...a, notes: e.target.value } : a
                    );
                    setAttendanceList(updated);
                  }}
                  sx={{ minWidth: 150 }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendanceDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              bulkMarkMutation.mutate(attendanceList.length > 0 ? attendanceList : attendance);
            }}
          >
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Attendance;

