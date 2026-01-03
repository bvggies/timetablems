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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search,
  LocationOn,
  MeetingRoom,
  People,
  Category,
  Build,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import ModernTable from '../components/ModernTable';
import BulkImport from '../components/BulkImport';

const Venues: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const user = authService.getStoredUser();
  const [open, setOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 50,
    type: 'HALL',
    resources: '',
  });

  const { data: venues, isLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const response = await api.get('/venues');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/venues', {
        ...data,
        resources: data.resources ? JSON.stringify(data.resources.split(',').map((r: string) => r.trim())) : null,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      setOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/venues/${id}`, {
        ...data,
        resources: data.resources ? JSON.stringify(data.resources.split(',').map((r: string) => r.trim())) : null,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      setOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/venues/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      capacity: 50,
      type: 'HALL',
      resources: '',
    });
    setEditingVenue(null);
  };

  const handleOpen = (venue?: any) => {
    if (venue) {
      setEditingVenue(venue);
      let resources = '';
      if (venue.resources) {
        try {
          const parsed = JSON.parse(venue.resources);
          resources = Array.isArray(parsed) ? parsed.join(', ') : '';
        } catch (e) {
          resources = '';
        }
      }
      setFormData({
        name: venue.name,
        location: venue.location || '',
        capacity: venue.capacity,
        type: venue.type,
        resources,
      });
    } else {
      resetForm();
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVenue) {
      updateMutation.mutate({ id: editingVenue.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Loading venues...
        </Typography>
      </Box>
    );
  }

  const isAdmin = user?.role === 'ADMIN';

  const filteredVenues = venues?.filter((venue: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      venue.name.toLowerCase().includes(search) ||
      venue.location?.toLowerCase().includes(search) ||
      venue.type.toLowerCase().includes(search)
    );
  }) || [];

  const columns = [
    { id: 'name', label: 'Venue Name', minWidth: 150 },
    { id: 'location', label: 'Location', minWidth: 150 },
    { id: 'capacity', label: 'Capacity', minWidth: 100, align: 'center' as const },
    { id: 'type', label: 'Type', minWidth: 120 },
    { id: 'resources', label: 'Resources', minWidth: 200 },
    ...(isAdmin ? [{ id: 'actions', label: 'Actions', minWidth: 120, align: 'center' as const }] : []),
  ];

  const tableRows = filteredVenues.map((venue: any) => {
    let resources = [];
    if (venue.resources) {
      try {
        resources = JSON.parse(venue.resources);
      } catch (e) {
        resources = [];
      }
    }
    return {
      id: venue.id,
      name: venue.name,
      location: venue.location || 'N/A',
      capacity: venue.capacity,
      type: <Chip label={venue.type} size="small" color="primary" variant="outlined" />,
      resources:
        resources.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {resources.map((r: string, idx: number) => (
              <Chip key={idx} label={r} size="small" variant="outlined" />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            None
          </Typography>
        ),
      ...(isAdmin
        ? {
            actions: (
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpen(venue);
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
                    if (window.confirm('Are you sure you want to delete this venue?')) {
                      deleteMutation.mutate(venue.id);
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
    };
  });

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
            Venues
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Manage lecture halls and facilities
          </Typography>
        </Box>
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <BulkImport
              type="venues"
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['venues'] })}
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
              Add Venue
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
          placeholder="Search venues by name, location, or type..."
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

      {filteredVenues.length > 0 ? (
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
          <LocationOn sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No venues found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first venue'}
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
                {editingVenue ? 'Edit Venue' : 'Add New Venue'}
              </Typography>
              <DialogContentText sx={{ mt: 1 }}>
                {editingVenue
                  ? 'Update the venue details below.'
                  : 'Fill out the form to add a new venue.'}
              </DialogContentText>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Venue Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MeetingRoom sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: parseInt(e.target.value) })
                    }
                    required
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Type"
                    select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Category sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="HALL">Hall</MenuItem>
                    <MenuItem value="LAB">Lab</MenuItem>
                    <MenuItem value="SEMINAR">Seminar Room</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Resources (comma-separated)"
                    value={formData.resources}
                    onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                    placeholder="e.g., projector, whiteboard, sound-system"
                    helperText="Enter resources separated by commas"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Build sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
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
              <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2, px: 3 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending || updateMutation.isPending}
                sx={{ borderRadius: 2, px: 3 }}
              >
                {editingVenue ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </Box>
  );
};

export default Venues;
