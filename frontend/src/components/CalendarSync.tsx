import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Typography,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  CalendarToday,
  CloudDownload,
  Link as LinkIcon,
  CheckCircle,
  Google,
  Apple,
  Email,
} from '@mui/icons-material';
import { exportToICS } from '../utils/export';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';

interface CalendarSyncProps {
  sessions: any[];
  semesterStartDate?: Date;
  semesterEndDate?: Date;
}

const CalendarSync: React.FC<CalendarSyncProps> = ({
  sessions,
  semesterStartDate,
  semesterEndDate,
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const { data: currentSemester } = useQuery({
    queryKey: ['current-semester'],
    queryFn: async () => {
      const response = await api.get('/semesters?status=ACTIVE');
      return response.data?.[0];
    },
  });

  const handleDownloadICS = async () => {
    try {
      const startDate = semesterStartDate || (currentSemester?.startDate 
        ? new Date(currentSemester.startDate) 
        : new Date());
      
      // Map sessions to export format
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
      
      await exportToICS(mappedSessions, 'PUG Timetable', startDate);
      setSnackbar({ open: true, message: 'Calendar file downloaded successfully!' });
      setOpen(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to export calendar. Please try again.' });
    }
  };

  const handleGoogleCalendar = () => {
    if (!sessions || sessions.length === 0) return;

    const startDate = semesterStartDate || (currentSemester?.startDate 
      ? new Date(currentSemester.startDate) 
      : new Date());

    // Generate Google Calendar URL for first session as example
    const firstSession = sessions[0];
    const sessionDate = new Date(startDate);
    let daysToAdd = (firstSession.dayOfWeek - sessionDate.getDay() + 7) % 7;
    if (daysToAdd === 0) {
      // If same day, check if time has passed
      const [startHour, startMinute] = firstSession.startTime.split(':').map(Number);
      const now = new Date();
      const sessionTime = new Date(sessionDate);
      sessionTime.setHours(startHour, startMinute, 0, 0);
      if (sessionTime < now) {
        daysToAdd = 7; // Next week
      }
    }
    sessionDate.setDate(sessionDate.getDate() + daysToAdd);

    const [startHour, startMinute] = firstSession.startTime.split(':').map(Number);
    const [endHour, endMinute] = firstSession.endTime.split(':').map(Number);

    const startDateTime = new Date(sessionDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);
    const endDateTime = new Date(sessionDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    const title = encodeURIComponent(
      `${firstSession.Course?.code || 'N/A'} - ${firstSession.Course?.title || 'N/A'}`
    );
    const details = encodeURIComponent(
      `Lecturer: ${firstSession.User?.firstName || ''} ${firstSession.User?.lastName || ''}\nVenue: ${firstSession.Venue?.name || 'TBA'}`
    );
    const location = encodeURIComponent(
      firstSession.Venue?.name || 'TBA'
    );

    const startStr = startDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endStr = endDateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
    
    window.open(googleUrl, '_blank');
    setSnackbar({ open: true, message: 'Opening Google Calendar... Download ICS file for all sessions.' });
    setOpen(false);
  };

  const copySubscriptionLink = () => {
    // In a real implementation, this would be a server-generated subscription URL
    const subscriptionUrl = `${window.location.origin}/api/timetable/calendar/subscribe`;
    navigator.clipboard.writeText(subscriptionUrl);
    setSnackbar({ open: true, message: 'Subscription link copied to clipboard!' });
  };

  return (
    <>
      <Tooltip title="Sync with Calendar">
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            color: 'primary.main',
            '&:hover': {
              background: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <CalendarToday />
        </IconButton>
      </Tooltip>

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
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ color: 'primary.main' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Sync with Calendar
            </Typography>
          </Box>
          <DialogContentText sx={{ mt: 1 }}>
            Export your timetable to your favorite calendar application
          </DialogContentText>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CloudDownload />}
              onClick={handleDownloadICS}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                borderRadius: 2,
              }}
            >
              <Box sx={{ textAlign: 'left', flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Download ICS File
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Import to any calendar app (Google, Apple, Outlook)
                </Typography>
              </Box>
            </Button>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Google />}
              onClick={handleGoogleCalendar}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                borderRadius: 2,
                borderColor: '#4285f4',
                color: '#4285f4',
                '&:hover': {
                  borderColor: '#4285f4',
                  background: alpha('#4285f4', 0.1),
                },
              }}
            >
              <Box sx={{ textAlign: 'left', flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Add to Google Calendar
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Quick add (download ICS for all sessions)
                </Typography>
              </Box>
            </Button>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: alpha(theme.palette.info.main, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                <LinkIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                Calendar Subscription
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Subscribe to automatic updates. Your calendar will sync when timetable changes.
              </Typography>
              <Button
                size="small"
                variant="text"
                startIcon={<LinkIcon />}
                onClick={copySubscriptionLink}
                sx={{ mt: 1 }}
              >
                Copy Subscription Link
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Instructions:</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'block', mt: 0.5 }}>
                • <strong>ICS File:</strong> Download and import to your calendar app
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Google Calendar:</strong> Click to add first session, then import ICS for all
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Apple Calendar:</strong> Download ICS and double-click to import
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div">
                • <strong>Outlook:</strong> Download ICS and import via File → Open & Export
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CalendarSync;

