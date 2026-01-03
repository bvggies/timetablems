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
  useTheme,
  alpha,
} from '@mui/material';
import {
  Download as DownloadIcon,
  PictureAsPdf,
  TableChart,
  CalendarToday,
  FileDownload,
  AccessTime,
  LocationOn,
  Person,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';
import { exportToPDF, exportToExcel, exportToCSV, exportToICS } from '../utils/export';
import { authService } from '../services/auth';
import CalendarSync from '../components/CalendarSync';

const Timetable: React.FC = () => {
  const theme = useTheme();
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

    const mappedSessions = sessions.map((session: any) => ({
      id: session.id,
      course: {
        code: session.Course?.code || 'N/A',
        title: session.Course?.title || 'N/A',
      },
      lecturer: {
        firstName: session.User?.firstName || 'N/A',
        lastName: session.User?.lastName || 'N/A',
      },
      venue: {
        name: session.Venue?.name || 'N/A',
        location: session.Venue?.location || undefined,
      },
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      status: session.status,
    }));

    const title = `PUG_Timetable_${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'pdf':
        exportToPDF(mappedSessions, title);
        break;
      case 'excel':
        exportToExcel(mappedSessions, title);
        break;
      case 'csv':
        exportToCSV(mappedSessions, title);
        break;
      case 'ics':
        const semesterStartDate = sessions[0]?.Semester?.startDate 
          ? new Date(sessions[0].Semester.startDate)
          : new Date();
        exportToICS(mappedSessions, title, semesterStartDate);
        break;
    }
    setExportMenuAnchor(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Loading timetable...
        </Typography>
      </Box>
    );
  }

  const sessionsByDay = sessions?.reduce((acc: any, session: any) => {
    const day = session.dayOfWeek;
    if (!acc[day]) acc[day] = [];
    acc[day].push(session);
    return acc;
  }, {}) || {};

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
            Timetable
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
            Your class schedule for this semester
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <CalendarSync 
            sessions={sessions || []} 
            semesterStartDate={undefined}
          />
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.25,
            }}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={() => handleExport('pdf')} sx={{ borderRadius: 1, mx: 0.5 }}>
          <PictureAsPdf sx={{ mr: 1.5 }} /> Export as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')} sx={{ borderRadius: 1, mx: 0.5 }}>
          <TableChart sx={{ mr: 1.5 }} /> Export as Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')} sx={{ borderRadius: 1, mx: 0.5 }}>
          <FileDownload sx={{ mr: 1.5 }} /> Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('ics')} sx={{ borderRadius: 1, mx: 0.5 }}>
          <CalendarToday sx={{ mr: 1.5 }} /> Export as Calendar (ICS)
        </MenuItem>
      </Menu>

      <Grid container spacing={3}>
        {days.map((day, dayIndex) => {
          const daySessions = sessionsByDay[dayIndex] || [];
          return (
            <Grid item xs={12} md={6} lg={4} key={day}>
              <Paper 
                sx={{ 
                  p: 3,
                  height: '100%',
                  background: theme.palette.mode === 'light'
                    ? 'white'
                    : alpha(theme.palette.background.paper, 0.8),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    mb: 2,
                    pb: 1.5,
                    borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  {day}
                </Typography>
                {daySessions.length === 0 ? (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: 'text.secondary',
                    }}
                  >
                    <CalendarToday sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body2">
                      No classes scheduled
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {daySessions.map((session: any) => (
                      <Card 
                        key={session.id}
                        sx={{
                          background: theme.palette.mode === 'light'
                            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)'
                            : alpha(theme.palette.background.paper, 0.6),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight="bold"
                            sx={{ 
                              mb: 1.5,
                              color: 'primary.main',
                            }}
                          >
                            {session.Course?.code || 'N/A'} - {session.Course?.title || 'N/A'}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {session.startTime} - {session.endTime}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {session.Venue?.name || 'N/A'}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {session.User?.firstName || ''} {session.User?.lastName || ''}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ mt: 2 }}>
                            <Chip
                              label={session.status}
                              size="small"
                              color={session.status === 'PUBLISHED' ? 'success' : 'default'}
                              sx={{
                                fontWeight: 500,
                                borderRadius: 1,
                              }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
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
