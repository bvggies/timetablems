import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  useTheme,
  alpha,
  Avatar,
} from '@mui/material';
import { Search, People } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import ModernTable from '../components/ModernTable';

const Students: React.FC = () => {
  const theme = useTheme();
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
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Loading students...
        </Typography>
      </Box>
    );
  }

  const columns = [
    { id: 'pugId', label: 'PUG ID', minWidth: 120 },
    { id: 'name', label: 'Name', minWidth: 180 },
    { id: 'email', label: 'Email', minWidth: 200 },
    { id: 'department', label: 'Department', minWidth: 150 },
    { id: 'level', label: 'Level', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100, align: 'center' as const },
  ];

  const tableRows = students?.map((student: any) => ({
    id: student.id,
    pugId: (
      <Chip
        label={student.pugId}
        size="small"
        sx={{
          fontWeight: 600,
          background: alpha(theme.palette.primary.main, 0.1),
          color: 'primary.main',
        }}
      />
    ),
    name: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: '0.875rem',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        >
          {student.firstName?.[0] || 'S'}
        </Avatar>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {student.firstName} {student.lastName}
          </Typography>
        </Box>
      </Box>
    ),
    email: student.email,
    department: student.Department?.name || 'N/A',
    level: student.Level?.name || 'N/A',
    status: (
      <Chip
        label={student.status}
        size="small"
        color={student.status === 'ACTIVE' ? 'success' : 'default'}
        sx={{ fontWeight: 500 }}
      />
    ),
  })) || [];

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: theme.palette.mode === 'light'
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Students
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            View and manage student accounts
          </Typography>
        </Box>
      </Box>

      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <TextField
          fullWidth
          placeholder="Search students by name, email, or PUG ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {tableRows.length > 0 ? (
        <ModernTable
          columns={columns}
          rows={tableRows}
          emptyMessage="No students found"
        />
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <People sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No students found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search criteria' : 'No students registered yet'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Students;
