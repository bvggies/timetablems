import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  useTheme,
  alpha,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService, LoginCredentials } from '../../services/auth';
import Logo from '../../components/Logo';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: () => {
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Login failed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'light'
            ? 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)'
            : 'radial-gradient(circle at 20% 50%, rgba(129, 140, 248, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(167, 139, 250, 0.2) 0%, transparent 50%)',
        },
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              mb: 5,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 4,
                  background: alpha(theme.palette.common.white, 0.15),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Logo size={120} variant="icon" color="white" />
              </Box>
            </Box>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'white',
                mb: 1,
              }}
            >
              PUG Timetable System
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: alpha(theme.palette.common.white, 0.9),
                fontWeight: 400,
              }}
            >
              Sign in to your account
            </Typography>
          </Box>

          <Paper 
            elevation={24}
            sx={{ 
              p: 4, 
              width: '100%',
              borderRadius: 4,
              background: theme.palette.mode === 'light' ? 'white' : alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(10px)',
            }}
          >
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loginMutation.isPending}
                sx={{
                  py: 1.5,
                  mb: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Link 
                  component={RouterLink} 
                  to="/forgot-password" 
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>
              <Box sx={{ textAlign: 'center', mt: 1 }}>
                <Link 
                  component={RouterLink} 
                  to="/register" 
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
