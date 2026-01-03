import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  MarkEmailRead,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { format } from 'date-fns';

const Notifications: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const response = await api.get('/notifications/unread-count');
        return response.data;
      } catch (error: any) {
        // Handle 401 (unauthorized) gracefully
        if (error.response?.status === 401) {
          return { count: 0 };
        }
        throw error;
      }
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TIMETABLE_CHANGE':
        return 'warning';
      case 'CLASS_REMINDER':
        return 'info';
      case 'ANNOUNCEMENT':
        return 'primary';
      case 'SYSTEM':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <Typography>Loading notifications...</Typography>;
  }

  const unreadNotifications = notifications?.filter((n: any) => !n.readAt) || [];
  const readNotifications = notifications?.filter((n: any) => n.readAt) || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Notifications</Typography>
        {unreadCount?.count > 0 && (
          <Button
            variant="outlined"
            startIcon={<MarkEmailRead />}
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {unreadCount?.count > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <Typography variant="h6">
            You have {unreadCount.count} unread notification{unreadCount.count !== 1 ? 's' : ''}
          </Typography>
        </Paper>
      )}

      {unreadNotifications.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Unread ({unreadNotifications.length})
          </Typography>
          <Paper>
            <List>
              {unreadNotifications.map((notification: any) => (
                <ListItem
                  key={notification.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <CheckCircle />
                    </IconButton>
                  }
                  sx={{
                    bgcolor: 'action.hover',
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <ListItemButton>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type.replace('_', ' ')}
                            size="small"
                            color={getTypeColor(notification.type) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {format(new Date(notification.createdAt), 'PPp')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {readNotifications.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Read ({readNotifications.length})
          </Typography>
          <Paper>
            <List>
              {readNotifications.map((notification: any, index: number) => (
                <React.Fragment key={notification.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type.replace('_', ' ')}
                            size="small"
                            color={getTypeColor(notification.type) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {format(new Date(notification.createdAt), 'PPp')}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < readNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {notifications?.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You're all caught up!
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Notifications;

