import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', searchTerm],
    queryFn: async () => {
      const response = await api.get('/users', {
        params: {
          role: 'STUDENT',
          search: searchTerm || undefined,
        },
      });
      return response.data;
    },
  });

  if (isLoading) {
    return <Typography>Loading students...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Students
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage student accounts
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search students by name, email, or PUG ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {students && students.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PUG ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student: any) => (
                <TableRow key={student.id}>
                  <TableCell>{student.pugId}</TableCell>
                  <TableCell>
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.Department?.name || 'N/A'}</TableCell>
                  <TableCell>{student.Level?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={student.status}
                      size="small"
                      color={student.status === 'ACTIVE' ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            No students found
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Students;

