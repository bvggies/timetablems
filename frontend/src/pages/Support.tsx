import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle,
  Cancel,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import { format } from 'date-fns';

const Support: React.FC = () => {
  const queryClient = useQueryClient();
  const user = authService.getStoredUser();
  const isAdmin = user?.role === 'ADMIN';
  const [tabValue, setTabValue] = useState(0);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<any>(null);
  const [formData, setFormData] = useState({
    category: 'TECHNICAL',
    subject: '',
    message: '',
    screenshot: '',
  });

  const [adminFormData, setAdminFormData] = useState({
    status: 'OPEN',
    adminNotes: '',
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets', tabValue],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (tabValue === 1) params.append('status', 'OPEN');
      if (tabValue === 2) params.append('status', 'IN_PROGRESS');
      if (tabValue === 3) params.append('status', 'RESOLVED');
      const response = await api.get(`/support?${params.toString()}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/support', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setTicketDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/support/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setTicketDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/support/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });

  const resetForm = () => {
    setFormData({
      category: 'TECHNICAL',
      subject: '',
      message: '',
      screenshot: '',
    });
    setAdminFormData({
      status: 'OPEN',
      adminNotes: '',
    });
    setEditingTicket(null);
  };

  const handleOpenTicketDialog = (ticket?: any) => {
    if (ticket && isAdmin) {
      setEditingTicket(ticket);
      setAdminFormData({
        status: ticket.status,
        adminNotes: ticket.adminNotes || '',
      });
    } else {
      resetForm();
    }
    setTicketDialogOpen(true);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTicket && isAdmin) {
      updateMutation.mutate({
        id: editingTicket.id,
        data: adminFormData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'error';
      case 'IN_PROGRESS':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace('_', ' ');
  };

  if (isLoading) {
    return <Typography>Loading tickets...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Support & Help</Typography>
        {!isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenTicketDialog()}
          >
            Create Ticket
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Tickets" />
          <Tab label="Open" />
          <Tab label="In Progress" />
          <Tab label="Resolved" />
        </Tabs>
      </Paper>

      {tickets?.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <HelpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tickets found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {!isAdmin && 'Create a support ticket if you need help.'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                {isAdmin && <TableCell>User</TableCell>}
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets?.map((ticket: any) => (
                <TableRow key={ticket.id}>
                  <TableCell>#{ticket.id.slice(-8)}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Chip label={getCategoryLabel(ticket.category)} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket.status.replace('_', ' ')}
                      size="small"
                      color={getStatusColor(ticket.status) as any}
                    />
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      {ticket.User?.firstName || ''} {ticket.User?.lastName || ''}
                    </TableCell>
                  )}
                  <TableCell>
                    {format(new Date(ticket.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {isAdmin && (
                      <IconButton size="small" onClick={() => handleOpenTicketDialog(ticket)}>
                        <EditIcon />
                      </IconButton>
                    )}
                    {isAdmin && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (window.confirm('Delete this ticket?')) {
                            deleteMutation.mutate(ticket.id);
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Ticket Dialog */}
      <Dialog
        open={ticketDialogOpen}
        onClose={() => setTicketDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleSubmitTicket}>
          <DialogTitle>
            {editingTicket && isAdmin ? 'Manage Ticket' : 'Create Support Ticket'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {editingTicket && isAdmin
                ? 'Update the ticket status and add admin notes.'
                : 'Fill out the form below to create a support ticket.'}
            </DialogContentText>
            {editingTicket && isAdmin ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ticket Details
                  </Typography>
                  <Typography variant="body2">
                    <strong>Subject:</strong> {editingTicket.subject}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Category:</strong> {getCategoryLabel(editingTicket.category)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>User:</strong> {editingTicket.User?.firstName || ''}{' '}
                    {editingTicket.User?.lastName || ''} ({editingTicket.User?.email || 'N/A'})
                  </Typography>
                </Alert>
                <TextField
                  fullWidth
                  label="Status"
                  select
                  value={adminFormData.status}
                  onChange={(e) => setAdminFormData({ ...adminFormData, status: e.target.value })}
                  required
                  margin="normal"
                >
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Admin Notes"
                  value={adminFormData.adminNotes}
                  onChange={(e) =>
                    setAdminFormData({ ...adminFormData, adminNotes: e.target.value })
                  }
                  multiline
                  rows={4}
                  margin="normal"
                  helperText="Add notes about the resolution or status update"
                />
                {editingTicket.message && (
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        User Message:
                      </Typography>
                      <Typography variant="body2">{editingTicket.message}</Typography>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Category"
                  select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  margin="normal"
                >
                  <MenuItem value="TECHNICAL">Technical Issue</MenuItem>
                  <MenuItem value="ACADEMIC">Academic Question</MenuItem>
                  <MenuItem value="TIMETABLE">Timetable Issue</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  multiline
                  rows={6}
                  margin="normal"
                  helperText="Describe your issue or question in detail"
                />
                <TextField
                  fullWidth
                  label="Screenshot URL (Optional)"
                  value={formData.screenshot}
                  onChange={(e) => setFormData({ ...formData, screenshot: e.target.value })}
                  margin="normal"
                  helperText="Paste a URL to a screenshot if applicable"
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTicketDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTicket && isAdmin ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Support;

