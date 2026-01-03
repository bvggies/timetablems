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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Search, People, Add, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import ModernTable from '../components/ModernTable';

const Students: React.FC = () => {
  const theme = useTheme();
  const user = authService.getStoredUser();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({
    pugId: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    departmentId: '',
    levelId: '',
    status: 'ACTIVE',
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', searchTerm],
    queryFn: async () => {
      try {
        const response = await api.get('/users', {
          params: {
            role: 'STUDENT',
            search: searchTerm || undefined,
          },
        });
        return response.data;
      } catch (error: any) {
        // Handle 403 (forbidden) gracefully - lecturers can't access this endpoint
        if (error.response?.status === 403 || error.response?.status === 401) {
          return [];
        }
        throw error;
      }
    },
    enabled: authService.isAuthenticated() && user?.role === 'ADMIN',
    retry: (failureCount, error: any) => {
      // Don't retry on 403/401 errors
      if (error?.response?.status === 403 || error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/departments');
      return response.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const response = await api.get('/levels');
      return response.data;
    },
    enabled: user?.role === 'ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/users', { ...data, role: 'STUDENT' });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      handleCloseDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      handleCloseDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const handleOpenDialog = (student?: any) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        pugId: student.pugId || '',
        email: student.email || '',
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        phone: student.phone || '',
        password: '',
        departmentId: student.departmentId || '',
        levelId: student.levelId || '',
        status: student.status || 'ACTIVE',
      });
    } else {
      setEditingStudent(null);
      setFormData({
        pugId: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        departmentId: '',
        levelId: '',
        status: 'ACTIVE',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStudent(null);
    setFormData({
      pugId: '',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      password: '',
      departmentId: '',
      levelId: '',
      status: 'ACTIVE',
    });
  };

  const handleSubmit = () => {
    if (editingStudent) {
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      updateMutation.mutate({ id: editingStudent.id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(studentId);
    }
  };

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
    ...(user?.role === 'ADMIN'
      ? [
          {
            id: 'actions',
            label: 'Actions',
            minWidth: 120,
            align: 'center' as const,
            render: (row: any) => (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(row)}
                  sx={{ color: 'primary.main' }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(row.id)}
                  sx={{ color: 'error.main' }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ),
          },
        ]
      : []),
  ];

  const tableRows = students?.map((student: any) => {
    const row: any = {
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
    };
    return row;
  }) || [];

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
            {user?.role === 'ADMIN' ? 'View and manage student accounts' : 'View student accounts'}
          </Typography>
        </Box>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              },
            }}
          >
            Add Student
          </Button>
        )}
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

      {/* Add/Edit Dialog */}
      {user?.role === 'ADMIN' && (
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="PUG ID"
                fullWidth
                required
                value={formData.pugId}
                onChange={(e) => setFormData({ ...formData, pugId: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </Box>
              <TextField
                label="Phone"
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <TextField
                label={editingStudent ? 'New Password (leave blank to keep current)' : 'Password'}
                type="password"
                fullWidth
                required={!editingStudent}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.departmentId}
                  label="Department"
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                >
                  {departments?.map((dept: any) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={formData.levelId}
                  label="Level"
                  onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                >
                  {levels?.map((level: any) => (
                    <MenuItem key={level.id} value={level.id}>
                      {level.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingStudent ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Students;
