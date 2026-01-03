import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccessTime,
  LocationOn,
  School,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import { format, differenceInMinutes, isToday, isTomorrow, addDays } from 'date-fns';

interface NextClassWidgetProps {
  compact?: boolean;
}

const NextClassWidget: React.FC<NextClassWidgetProps> = ({ compact = false }) => {
  const theme = useTheme();
  const user = authService.getStoredUser();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const { data: nextClass, isLoading } = useQuery({
    queryKey: ['next-class'],
    queryFn: async () => {
      const response = await api.get('/timetable/next-class');
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
    enabled: !!user && (user.role === 'STUDENT' || user.role === 'LECTURER'),
  });

  useEffect(() => {
    if (!nextClass) return;

    const updateCountdown = () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Calculate next class date
      const daysUntilClass = (nextClass.dayOfWeek - now.getDay() + 7) % 7;
      const classDate = addDays(today, daysUntilClass === 0 && getTimeInMinutes(nextClass.startTime) <= getTimeInMinutes(format(now, 'HH:mm')) ? 7 : daysUntilClass);
      
      const [hours, minutes] = nextClass.startTime.split(':').map(Number);
      classDate.setHours(hours, minutes, 0, 0);

      const diffMinutes = differenceInMinutes(classDate, now);

      if (diffMinutes < 0) {
        setTimeRemaining('Class in progress');
      } else if (diffMinutes < 60) {
        setTimeRemaining(`${diffMinutes} min`);
      } else {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        setTimeRemaining(`${hours}h ${mins}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextClass]);

  const getTimeInMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getDayLabel = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getRelativeDay = (dayOfWeek: number): string => {
    const now = new Date();
    const today = now.getDay();
    const diff = (dayOfWeek - today + 7) % 7;
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return getDayLabel(dayOfWeek);
  };

  if (isLoading) {
    return (
      <Card
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography>Loading next class...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!nextClass) {
    return (
      <Card
        sx={{
          background: alpha(theme.palette.background.paper, 0.8),
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CalendarToday sx={{ color: 'text.secondary' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Next Class
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            No upcoming classes scheduled
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: 'white',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          transform: 'translate(50%, -50%)',
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
              {getRelativeDay(nextClass.dayOfWeek)}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {nextClass.Course?.code || 'N/A'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {nextClass.Course?.title || 'N/A'}
            </Typography>
          </Box>
          <Chip
            label={timeRemaining}
            size="small"
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          />
        </Box>

        {!compact && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTime sx={{ fontSize: 18, opacity: 0.9 }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {nextClass.startTime} - {nextClass.endTime}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ fontSize: 18, opacity: 0.9 }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {nextClass.Venue?.name || 'TBA'}
              </Typography>
            </Box>
            {user?.role === 'STUDENT' && nextClass.User && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ fontSize: 18, opacity: 0.9 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {nextClass.User.firstName} {nextClass.User.lastName}
                </Typography>
              </Box>
            )}
            {nextClass.Venue?.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 18, opacity: 0.9 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {nextClass.Venue.location}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default NextClassWidget;

