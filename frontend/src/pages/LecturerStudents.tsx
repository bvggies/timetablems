import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { People, School } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';

const LecturerStudents: React.FC = () => {
  const user = authService.getStoredUser();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const { data: courseStudents, isLoading } = useQuery({
    queryKey: ['lecturer-course-students', selectedCourse, selectedSemester],
    queryFn: async () => {
      const params: any = {};
      if (selectedCourse) params.courseId = selectedCourse;
      if (selectedSemester) params.semesterId = selectedSemester;
      
      const response = await api.get('/courses/lecturer/students', { params });
      return response.data;
    },
    enabled: true,
  });

  const { data: semesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const response = await api.get('/semesters');
      return response.data;
    },
  });

  // Get unique courses from the response
  const courses = courseStudents?.map((item: any) => item.course) || [];

  if (isLoading) {
    return <Box sx={{ p: 3 }}>Loading...</Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Course Students</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Filter by Semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <MenuItem value="">All Semesters</MenuItem>
            {semesters?.map((semester: any) => (
              <MenuItem key={semester.id} value={semester.id}>
                {semester.year} {semester.term}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            select
            fullWidth
            label="Filter by Course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <MenuItem value="">All Courses</MenuItem>
            {courses.map((course: any) => (
              <MenuItem key={course.id} value={course.id}>
                {course.code} - {course.title}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {courseStudents && courseStudents.length > 0 ? (
        <Grid container spacing={3}>
          {courseStudents.map((item: any, index: number) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <School color="primary" />
                    <Typography variant="h6">
                      {item.course.code} - {item.course.title}
                    </Typography>
                    <Chip
                      label={`${item.students.length} student(s)`}
                      size="small"
                      color="primary"
                    />
                  </Box>

                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>PUG ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Level</TableCell>
                          <TableCell>Semester</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {item.students.map((student: any) => (
                          <TableRow key={student.id}>
                            <TableCell>{student.pugId}</TableCell>
                            <TableCell>
                              {student.firstName} {student.lastName}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.department || 'N/A'}</TableCell>
                            <TableCell>{student.level || 'N/A'}</TableCell>
                            <TableCell>
                              {student.semester?.year} {student.semester?.term}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <People sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No students found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedCourse || selectedSemester
                  ? 'Try adjusting your filters'
                  : 'You may not have any courses assigned yet'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default LecturerStudents;

