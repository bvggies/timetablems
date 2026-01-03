import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  useTheme,
  alpha,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Search,
  School,
  LocationOn,
  Person,
  CalendarToday,
  Close,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['global-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return null;
      const response = await api.get('/search', {
        params: { q: searchTerm },
      });
      return response.data;
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
  });

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const results = searchResults || { courses: [], venues: [], users: [], sessions: [] };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '80vh',
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Search courses, venues, lecturers, sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <Close
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSearchTerm('')}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </Box>
      <DialogContent sx={{ p: 0 }}>
        {!searchTerm || searchTerm.length < 2 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Search sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Start typing to search...
            </Typography>
          </Box>
        ) : isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Searching...
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {results.courses && results.courses.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, background: alpha(theme.palette.primary.main, 0.05) }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    COURSES ({results.courses.length})
                  </Typography>
                </Box>
                {results.courses.map((course: any) => (
                  <ListItem key={course.id} disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <School sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={course.code}
                        secondary={course.title}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider />
              </>
            )}
            {results.venues && results.venues.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, background: alpha(theme.palette.secondary.main, 0.05) }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                    VENUES ({results.venues.length})
                  </Typography>
                </Box>
                {results.venues.map((venue: any) => (
                  <ListItem key={venue.id} disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <LocationOn sx={{ color: 'secondary.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={venue.name}
                        secondary={venue.location}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider />
              </>
            )}
            {results.users && results.users.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, background: alpha(theme.palette.success.main, 0.05) }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'success.main' }}>
                    LECTURERS ({results.users.length})
                  </Typography>
                </Box>
                {results.users.map((user: any) => (
                  <ListItem key={user.id} disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <Person sx={{ color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${user.firstName} ${user.lastName}`}
                        secondary={user.email}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
                <Divider />
              </>
            )}
            {results.sessions && results.sessions.length > 0 && (
              <>
                <Box sx={{ px: 2, py: 1, background: alpha(theme.palette.info.main, 0.05) }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'info.main' }}>
                    SESSIONS ({results.sessions.length})
                  </Typography>
                </Box>
                {results.sessions.map((session: any) => (
                  <ListItem key={session.id} disablePadding>
                    <ListItemButton>
                      <ListItemIcon>
                        <CalendarToday sx={{ color: 'info.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${session.Course?.code} - ${session.startTime}`}
                        secondary={`${session.Venue?.name} | ${session.User?.firstName} ${session.User?.lastName}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </>
            )}
            {searchTerm.length >= 2 && !isLoading && 
             (!results.courses || results.courses.length === 0) &&
             (!results.venues || results.venues.length === 0) &&
             (!results.users || results.users.length === 0) &&
             (!results.sessions || results.sessions.length === 0) && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No results found for "{searchTerm}"
                </Typography>
              </Box>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;

