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
  Autocomplete,
} from '@mui/material';
import { Add, People, Group } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { authService } from '../services/auth';
import ModernTable from '../components/ModernTable';

const StudentGroups: React.FC = () => {
  const user = authService.getStoredUser();
  const queryClient = useQueryClient();
  const [groupDialog, setGroupDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentId: '',
    levelId: '',
    semesterId: '',
    studentIds: [] as string[],
  });

  const { data: groups } = useQuery({
    queryKey: ['student-groups'],
    queryFn: async () => {
      const res = await api.get('/api/student-groups/groups');
      return res.data;
    },
  });

  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await api.get('/api/users', { params: { role: 'STUDENT' } });
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

  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/api/student-groups/groups', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-groups'] });
      setGroupDialog(false);
    },
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Student Groups</Typography>
        {(user?.role === 'ADMIN' || user?.role === 'LECTURER') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setGroupDialog(true)}
          >
            Create Group
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {groups?.map((group: any) => (
          <Grid item xs={12} md={6} key={group.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">{group.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {group.description || 'No description'}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      {group.Department && (
                        <Chip label={group.Department.name} size="small" />
                      )}
                      {group.Level && <Chip label={group.Level.name} size="small" />}
                    </Box>
                  </Box>
                  <Chip
                    icon={<People />}
                    label={`${group.Members?.length || 0} members`}
                    color="primary"
                  />
                </Box>
                <Typography variant="subtitle2" gutterBottom>
                  Members:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {group.Members?.map((member: any) => (
                    <Chip
                      key={member.id}
                      label={`${member.Student.firstName} ${member.Student.lastName}`}
                      size="small"
                    />
                  ))}
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    // Navigate to group timetable
                    window.location.href = `/timetable?groupId=${group.id}`;
                  }}
                >
                  View Group Timetable
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={groupDialog} onClose={() => setGroupDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Student Group</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Group Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={formData.semesterId}
                  onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                >
                  {semesters?.map((sem: any) => (
                    <MenuItem key={sem.id} value={sem.id}>
                      {sem.year} {sem.term}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={students || []}
                getOptionLabel={(option: any) => `${option.firstName} ${option.lastName} (${option.pugId})`}
                value={(students || []).filter((s: any) => formData.studentIds.includes(s.id))}
                onChange={(_, newValue) => {
                  setFormData({ ...formData, studentIds: newValue.map((v: any) => v.id) });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Students" placeholder="Students" />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createGroupMutation.mutate(formData)}
          >
            Create Group
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentGroups;

