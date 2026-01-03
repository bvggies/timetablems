import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf,
  TableChart,
  CalendarToday,
  FileDownload,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';
import { exportToPDF, exportToExcel, exportToCSV, exportToICS } from '../utils/export';
import { authService } from '../services/auth';

const Timetable: React.FC = () => {
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const user = authService.getStoredUser();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['timetable'],
    queryFn: async () => {
      const response = await api.get('/timetable');
      return response.data;
    },
  });

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'ics') => {
    if (!sessions || sessions.length === 0) {
      alert('No timetable data to export');
      return;
    }

    const title = `${user?.firstName || 'My'}_Timetable`;

    switch (format) {
      case 'pdf':
        exportToPDF(sessions, title);
        break;
      case 'excel':
        exportToExcel(sessions, title);
        break;
      case 'csv':
        exportToCSV(sessions, title);
        break;
      case 'ics':
        exportToICS(sessions, title, new Date());
        break;
    }
    setExportMenuAnchor(null);
  };

  if (isLoading) {
    return <Typography>Loading timetable...</Typography>;
  }

  const sessionsByDay = sessions?.reduce((acc: any, session: any) => {
    const day = session.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(session);
    return acc;
  }, {}) || {};

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Timetable
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your class schedule for this semester
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={(e) => setExportMenuAnchor(e.currentTarget)}
        >
          Export
        </Button>
      </Box>

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('pdf')}>
          <PictureAsPdf sx={{ mr: 1 }} /> Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          <TableChart sx={{ mr: 1 }} /> Export as Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <FileDownload sx={{ mr: 1 }} /> Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('ics')}>
          <CalendarToday sx={{ mr: 1 }} /> Export as Calendar (ICS)
        </MenuItem>
      </Menu>
      <Grid container spacing={2}>
        {days.map((day, dayIndex) => {
          const daySessions = sessionsByDay[dayIndex] || [];
          return (
            <Grid item xs={12} md={6} lg={4} key={day}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {day}
                </Typography>
                {daySessions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No classes scheduled
                  </Typography>
                ) : (
                  daySessions.map((session: any) => (
                    <Card key={session.id} sx={{ mb: 1 }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {session.course.code} - {session.course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {session.startTime} - {session.endTime}
                        </Typography>
                        <Typography variant="body2">
                          Venue: {session.venue.name}
                        </Typography>
                        <Typography variant="body2">
                          Lecturer: {session.lecturer.firstName} {session.lecturer.lastName}
                        </Typography>
                        <Chip
                          label={session.status}
                          size="small"
                          color={session.status === 'PUBLISHED' ? 'success' : 'default'}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Timetable;

