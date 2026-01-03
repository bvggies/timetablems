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
  useTheme,
  alpha,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  UploadFile,
  CloudUpload,
  CheckCircle,
} from '@mui/icons-material';
import api from '../services/api';
import { useMutation } from '@tanstack/react-query';

interface BulkImportProps {
  type: 'courses' | 'venues' | 'users';
  onSuccess?: () => void;
}

const BulkImport: React.FC<BulkImportProps> = ({ type, onSuccess }) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/import/${type}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      setOpen(false);
      setFile(null);
      onSuccess?.();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file) {
      importMutation.mutate(file);
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'courses': return 'Courses';
      case 'venues': return 'Venues';
      case 'users': return 'Users';
      default: return 'Data';
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<UploadFile />}
        onClick={() => setOpen(true)}
        sx={{ borderRadius: 2 }}
      >
        Import {getTypeLabel()}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Import {getTypeLabel()}
          </Typography>
          <DialogContentText sx={{ mt: 1 }}>
            Upload an Excel (.xlsx) or CSV file to bulk import {getTypeLabel().toLowerCase()}
          </DialogContentText>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box
            sx={{
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                background: alpha(theme.palette.primary.main, 0.05),
              },
            }}
            onClick={() => document.getElementById(`file-input-${type}`)?.click()}
          >
            <input
              id={`file-input-${type}`}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              {file ? file.name : 'Click to upload file'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Excel (.xlsx, .xls) or CSV files only
            </Typography>
          </Box>

          {importMutation.isPending && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Importing {getTypeLabel().toLowerCase()}...
              </Typography>
            </Box>
          )}

          {importMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Successfully imported {importMutation.data?.courses?.length || importMutation.data?.venues?.length || importMutation.data?.users?.length || 0} {getTypeLabel().toLowerCase()}!
            </Alert>
          )}

          {importMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to import {getTypeLabel().toLowerCase()}. Please check your file format.
            </Alert>
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              File Format Requirements:
            </Typography>
            <Typography variant="caption" component="div">
              {type === 'courses' && (
                <>Required columns: code, title, credits, departmentId, levelId, expectedSize</>
              )}
              {type === 'venues' && (
                <>Required columns: name, location, capacity, type, resources</>
              )}
              {type === 'users' && (
                <>Required columns: pugId, email, password, firstName, lastName, role, departmentId, levelId</>
              )}
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!file || importMutation.isPending}
            sx={{ borderRadius: 2 }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkImport;

