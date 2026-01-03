import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const Reports: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState('');

  const { data: semesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const response = await api.get('/semesters');
      return response.data;
    },
  });

  const { data: occupancyData, isLoading: occupancyLoading } = useQuery({
    queryKey: ['reports', 'occupancy', selectedSemester],
    queryFn: async () => {
      const params = selectedSemester ? `?semesterId=${selectedSemester}` : '';
      const response = await api.get(`/reports/occupancy${params}`);
      return response.data;
    },
  });

  const { data: workloadData, isLoading: workloadLoading } = useQuery({
    queryKey: ['reports', 'workload', selectedSemester],
    queryFn: async () => {
      const params = selectedSemester ? `?semesterId=${selectedSemester}` : '';
      const response = await api.get(`/reports/workload${params}`);
      return response.data;
    },
  });

  const { data: usageStats } = useQuery({
    queryKey: ['reports', 'usage'],
    queryFn: async () => {
      const response = await api.get('/reports/usage');
      return response.data;
    },
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Prepare chart data
  const occupancyChartData = occupancyData?.map((venue: any) => ({
    name: venue.venueName,
    utilization: parseFloat(venue.utilizationRate.toFixed(1)),
    capacity: venue.capacity,
    sessions: venue.totalSessions,
  })) || [];

  const workloadChartData = workloadData?.map((lecturer: any) => ({
    name: lecturer.lecturerName.split(' ')[0], // First name only for chart
    courses: lecturer.totalCourses,
    credits: lecturer.totalCredits,
    sessions: lecturer.totalSessions,
  })) || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <TextField
          select
          label="Semester"
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Semesters</MenuItem>
          {semesters?.map((semester: any) => (
            <MenuItem key={semester.id} value={semester.id}>
              {semester.year} {semester.term}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Usage Statistics */}
      {usageStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">{usageStats.totalUsers}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {usageStats.activeUsers} active
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Courses
                </Typography>
                <Typography variant="h4">{usageStats.totalCourses}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Published Sessions
                </Typography>
                <Typography variant="h4">{usageStats.totalSessions}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Registrations
                </Typography>
                <Typography variant="h4">{usageStats.totalRegistrations}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Occupancy Report */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Venue Occupancy Report
        </Typography>
        {occupancyLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={occupancyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" fill="#8884d8" name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Venue</TableCell>
                    <TableCell align="right">Capacity</TableCell>
                    <TableCell align="right">Total Sessions</TableCell>
                    <TableCell align="right">Total Students</TableCell>
                    <TableCell align="right">Utilization Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {occupancyData?.map((venue: any) => (
                    <TableRow key={venue.venueId}>
                      <TableCell>{venue.venueName}</TableCell>
                      <TableCell align="right">{venue.capacity}</TableCell>
                      <TableCell align="right">{venue.totalSessions}</TableCell>
                      <TableCell align="right">{venue.totalStudents}</TableCell>
                      <TableCell align="right">
                        {venue.utilizationRate.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

      {/* Workload Report */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Lecturer Workload Report
        </Typography>
        {workloadLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workloadChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="courses" fill="#82ca9d" name="Courses" />
                    <Bar dataKey="sessions" fill="#8884d8" name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workloadChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, credits }) => `${name}: ${credits}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="credits"
                    >
                      {workloadChartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Lecturer</TableCell>
                    <TableCell align="right">Total Courses</TableCell>
                    <TableCell align="right">Total Credits</TableCell>
                    <TableCell align="right">Total Sessions</TableCell>
                    <TableCell align="right">Sessions/Week</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workloadData?.map((lecturer: any) => (
                    <TableRow key={lecturer.lecturerId}>
                      <TableCell>{lecturer.lecturerName}</TableCell>
                      <TableCell align="right">{lecturer.totalCourses}</TableCell>
                      <TableCell align="right">{lecturer.totalCredits}</TableCell>
                      <TableCell align="right">{lecturer.totalSessions}</TableCell>
                      <TableCell align="right">{lecturer.sessionsPerWeek}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Reports;

