import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  useTheme,
  alpha,
  InputAdornment,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search,
  School,
  Code,
  Description,
  People,
  Category,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import ModernTable from '../components/ModernTable';
import BulkImport from '../components/BulkImport';

const Courses: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const user = authService.getStoredUser();
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    credits: 3,
    description: '',
    departmentId: '',
    levelId: '',
    expectedSize: 50,
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await api.get('/courses');
      return response.data;
    },
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await api.get('/departments');
      return response.data;
    },
  });

  const { data: levels } = useQuery({
    queryKey: ['levels'],
    queryFn: async () => {
      const response = await api.get('/levels');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/courses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/courses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      credits: 3,
      description: '',
      departmentId: '',
      levelId: '',
      expectedSize: 50,
    });
    setEditingCourse(null);
  };

  const handleOpen = (course?: any) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        code: course.code,
        title: course.title,
        credits: course.credits,
        description: course.description || '',
        departmentId: course.departmentId,
        levelId: course.levelId,
        expectedSize: course.expectedSize,
      });
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCourse) {
      updateMutation.mutate({ id: editingCourse.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Loading courses...
        </Typography>
      </Box>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  const filteredCourses = courses?.filter((course: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      course.code.toLowerCase().includes(search) ||
      course.title.toLowerCase().includes(search) ||
      course.Department?.name?.toLowerCase().includes(search)
    );
  }) || [];

  const columns = [
    { id: 'code', label: 'Course Code', minWidth: 120 },
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'credits', label: 'Credits', minWidth: 80, align: 'center' as const },
    { id: 'department', label: 'Department', minWidth: 150 },
    { id: 'level', label: 'Level', minWidth: 120 },
    { id: 'expectedSize', label: 'Expected Size', minWidth: 120, align: 'center' as const },
    ...(isAdmin ? [{ id: 'actions', label: 'Actions', minWidth: 120, align: 'center' as const }] : []),
  ];

  const tableRows = filteredCourses.map((course: any) => ({
    id: course.id,
    code: <Chip label={course.code} color="primary" size="small" sx={{ fontWeight: 600 }} />,
    title: course.title,
    credits: course.credits,
    department: course.Department?.name || 'N/A',
    level: course.Level?.name || 'N/A',
    expectedSize: course.expectedSize,
    ...(isAdmin
      ? {
          actions: (
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen(course);
                }}
                sx={{
                  color: 'primary.main',
                  '&:hover': { background: alpha(theme.palette.primary.main, 0.1) },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this course?')) {
                    deleteMutation.mutate(course.id);
                  }
                }}
                sx={{
                  color: 'error.main',
                  '&:hover': { background: alpha(theme.palette.error.main, 0.1) },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ),
        }
      : {}),
  }));

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2,
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
            Courses
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Manage and view all available courses
          </Typography>
        </Box>
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <BulkImport
              type="courses"
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['courses'] })}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.25,
              }}
            >
              Add Course
            </Button>
          </Box>
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
          placeholder="Search courses by code, title, or department..."
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

      {filteredCourses.length > 0 ? (
        <ModernTable columns={columns} rows={tableRows} />
      ) : (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <School sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No courses found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first course'}
          </Typography>
        </Paper>
      )}

      {isAdmin && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
            },
          }}
        >
          <form onSubmit={handleSubmit}>
            <DialogTitle
              sx={{
                pb: 1,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </Typography>
              <DialogContentText sx={{ mt: 1 }}>
                {editingCourse
                  ? 'Update the course details below.'
                  : 'Fill out the form to add a new course.'}
              </DialogContentText>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Course Code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Code sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Credits"
                    type="number"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({ ...formData, credits: parseInt(e.target.value) })
                    }
                    required
                    InputProps={{
                      inputProps: { min: 1, max: 10 },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Course Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <School sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    select
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({ ...formData, departmentId: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Category sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    {departments?.map((dept: any) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Level"
                    select
                    value={formData.levelId}
                    onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                    required
                  >
                    {levels?.map((level: any) => (
                      <MenuItem key={level.id} value={level.id}>
                        {level.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    multiline
                    rows={3}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                          <Description sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Expected Class Size"
                    type="number"
                    value={formData.expectedSize}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedSize: parseInt(e.target.value) })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <People sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      inputProps: { min: 1 },
                    }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{
                px: 3,
                py: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Button
                onClick={() => setOpen(false)}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending || updateMutation.isPending}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {editingCourse ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default Courses;
