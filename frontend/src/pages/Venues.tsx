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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';

const Venues: React.FC = () => {
  const queryClient = useQueryClient();
  const user = authService.getStoredUser();
  const [open, setOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
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
    return <Typography>Loading venues...</Typography>;
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Venues</Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Venue
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Resources</TableCell>
              {isAdmin && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {venues?.map((venue: any) => {
              let resources = [];
              if (venue.resources) {
                try {
                  resources = JSON.parse(venue.resources);
                } catch (e) {
                  resources = [];
                }
              }
              return (
                <TableRow key={venue.id}>
                  <TableCell>{venue.name}</TableCell>
                  <TableCell>{venue.location || 'N/A'}</TableCell>
                  <TableCell>{venue.capacity}</TableCell>
                  <TableCell>
                    <Chip label={venue.type} size="small" />
                  </TableCell>
                  <TableCell>
                    {resources.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {resources.map((r: string, idx: number) => (
                          <Chip key={idx} label={r} size="small" variant="outlined" />
                        ))}
                      </Box>
                    ) : (
                      'None'
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpen(venue)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this venue?')) {
                            deleteMutation.mutate(venue.id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {isAdmin && (
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingVenue ? 'Edit Venue' : 'Add New Venue'}
            </DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Venue Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Type"
                select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                margin="normal"
              >
                <MenuItem value="HALL">Hall</MenuItem>
                <MenuItem value="LAB">Lab</MenuItem>
                <MenuItem value="SEMINAR">Seminar Room</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Resources (comma-separated)"
                value={formData.resources}
                onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
                placeholder="e.g., projector, whiteboard, sound-system"
                margin="normal"
                helperText="Enter resources separated by commas"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
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

