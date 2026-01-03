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
import { CalendarToday, Add, Event } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarPage: React.FC = () => {
  const user = authService.getStoredUser();
  const queryClient = useQueryClient();
  const [eventDialog, setEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'OTHER',
    isHoliday: false,
    semesterId: '',
  });

  const { data: events } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const res = await api.get('/api/calendar/events');
      return res.data;
    },
  });

  const { data: semesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await api.get('/api/semesters');
      return res.data;
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/api/calendar/events', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setEventDialog(false);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'OTHER',
        isHoliday: false,
        semesterId: '',
      });
    },
  });

  const handleSelectSlot = ({ start }: any) => {
    setSelectedDate(start);
    setFormData({
      ...formData,
      startDate: start.toISOString().split('T')[0],
      endDate: start.toISOString().split('T')[0],
    });
    setEventDialog(true);
  };

  const calendarEvents = (events || []).map((event: any) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    type: event.type,
    isHoliday: event.isHoliday,
  }));

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#3174ad';
    if (event.isHoliday) backgroundColor = '#d32f2f';
    else if (event.type === 'EXAM_PERIOD') backgroundColor = '#ed6c02';
    else if (event.type === 'REGISTRATION') backgroundColor = '#2e7d32';

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Academic Calendar</Typography>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setEventDialog(true)}
          >
            Add Event
          </Button>
        )}
      </Box>

      <Card sx={{ height: 'calc(100% - 80px)' }}>
        <CardContent sx={{ height: '100%' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectSlot={user?.role === 'ADMIN' ? handleSelectSlot : undefined}
            selectable={user?.role === 'ADMIN'}
            eventPropGetter={eventStyleGetter}
            defaultView="month"
          />
        </CardContent>
      </Card>

      <Dialog open={eventDialog} onClose={() => setEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Calendar Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="HOLIDAY">Holiday</MenuItem>
                  <MenuItem value="EXAM_PERIOD">Exam Period</MenuItem>
                  <MenuItem value="REGISTRATION">Registration</MenuItem>
                  <MenuItem value="BREAK">Break</MenuItem>
                  <MenuItem value="ORIENTATION">Orientation</MenuItem>
                  <MenuItem value="GRADUATION">Graduation</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={formData.semesterId}
                  onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {semesters?.map((sem: any) => (
                    <MenuItem key={sem.id} value={sem.id}>
                      {sem.year} {sem.term}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createEventMutation.mutate(formData)}
          >
            Create Event
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarPage;

