import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { History, Restore } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import ModernTable from '../../components/ModernTable';

const TimetableVersions: React.FC = () => {
  const queryClient = useQueryClient();
  const [rollbackDialog, setRollbackDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [semesterId, setSemesterId] = useState('');

  const { data: semesters } = useQuery({
    queryKey: ['semesters'],
    queryFn: async () => {
      const res = await api.get('/semesters');
      return res.data;
    },
  });

  const { data: versions } = useQuery({
    queryKey: ['timetable-versions', semesterId],
    queryFn: async () => {
      const res = await api.get('/timetable/versions', {
        params: { semesterId },
      });
      return res.data;
    },
    enabled: !!semesterId,
  });

  const rollbackMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/timetable/rollback', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable-versions'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      setRollbackDialog(false);
    },
  });

  const handleRollback = (version: any) => {
    setSelectedVersion(version);
    setRollbackDialog(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Timetable Versions
      </Typography>

      <Card sx={{ mt: 2, mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Semester
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {semesters?.map((sem: any) => (
              <Button
                key={sem.id}
                variant={semesterId === sem.id ? 'contained' : 'outlined'}
                onClick={() => setSemesterId(sem.id)}
              >
                {sem.year} {sem.term}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {semesterId && (
        <Card>
          <CardContent>
            <ModernTable
              data={versions || []}
              columns={[
                {
                  id: 'version',
                  label: 'Version',
                  render: (row: any) => (
                    <Chip
                      icon={<History />}
                      label={`v${row.version}`}
                      color="primary"
                    />
                  ),
                },
                {
                  id: 'publishedAt',
                  label: 'Published At',
                  render: (row: any) =>
                    row.publishedAt
                      ? new Date(row.publishedAt).toLocaleString()
                      : 'Not published',
                },
                {
                  id: 'publishedBy',
                  label: 'Published By',
                  render: (row: any) => row.publishedBy || '-',
                },
                {
                  id: 'notes',
                  label: 'Notes',
                  render: (row: any) => row.notes || '-',
                },
                {
                  id: 'actions',
                  label: 'Actions',
                  render: (row: any) => (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Restore />}
                      onClick={() => handleRollback(row)}
                    >
                      Rollback
                    </Button>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={rollbackDialog} onClose={() => setRollbackDialog(false)}>
        <DialogTitle>Rollback Timetable</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to rollback to version {selectedVersion?.version}? This will
            restore all sessions from that version.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Published: {selectedVersion?.publishedAt ? new Date(selectedVersion.publishedAt).toLocaleString() : 'N/A'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              rollbackMutation.mutate({
                semesterId,
                version: selectedVersion?.version,
              });
            }}
          >
            Confirm Rollback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimetableVersions;


