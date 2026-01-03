import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
} from '@mui/material';
import { Add, Event, LocationOn } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import ModernTable from '../components/ModernTable';

const ResourceBooking: React.FC = () => {
  const user = authService.getStoredUser();
  const queryClient = useQueryClient();
  const [bookingDialog, setBookingDialog] = useState(false);
  const [formData, setFormData] = useState({
    venueId: '',
    resourceType: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });

  const { data: venues } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      const res = await api.get('/venues');
      return res.data;
    },
  });

  const { data: bookings } = useQuery({
    queryKey: ['resource-bookings'],
    queryFn: async () => {
      const res = await api.get('/resources/bookings');
      return res.data;
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/resources/bookings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resource-bookings'] });
      setBookingDialog(false);
      setFormData({
        venueId: '',
        resourceType: '',
        startTime: '',
        endTime: '',
        purpose: '',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'COMPLETED':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Resource Booking</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setBookingDialog(true)}
        >
          Book Resource
        </Button>
      </Box>

      <Card>
        <CardContent>
          <ModernTable
            data={bookings || []}
            columns={[
              {
                id: 'venue',
                label: 'Venue',
                render: (row: any) => row.Venue?.name || 'N/A',
              },
              {
                id: 'resource',
                label: 'Resource Type',
                render: (row: any) => row.resourceType,
              },
              {
                id: 'time',
                label: 'Time',
                render: (row: any) => (
                  <>
                    {new Date(row.startTime).toLocaleString()} -{' '}
                    {new Date(row.endTime).toLocaleString()}
                  </>
                ),
              },
              {
                id: 'purpose',
                label: 'Purpose',
                render: (row: any) => row.purpose || '-',
              },
              {
                id: 'status',
                label: 'Status',
                render: (row: any) => (
                  <Chip
                    label={row.status}
                    color={getStatusColor(row.status) as any}
                    size="small"
                  />
                ),
              },
            ]}
          />
        </CardContent>
      </Card>

      <Dialog open={bookingDialog} onClose={() => setBookingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Book Resource</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Venue</InputLabel>
                <Select
                  value={formData.venueId}
                  onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                >
                  {venues?.map((venue: any) => (
                    <MenuItem key={venue.id} value={venue.id}>
                      {venue.name} ({venue.location})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Resource Type"
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                placeholder="e.g., Projector, Lab Equipment"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Time"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose"
                multiline
                rows={2}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createBookingMutation.mutate(formData)}
          >
            Book Resource
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourceBooking;

