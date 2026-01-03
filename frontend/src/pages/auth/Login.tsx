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
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
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
  const [showPassword, setShowPassword] = useState(false);

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
        background: theme.palette.mode === 'light' ? '#f8fafc' : '#0f172a',
      }}
    >
      {/* Left Side - Branding/Image Section */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            px: 4,
            color: 'white',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Logo size={100} variant="icon" color="white" />
          </Box>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { md: '2.5rem', lg: '3rem' },
            }}
          >
            Welcome to PUG Timetable
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 400,
              opacity: 0.9,
              maxWidth: 500,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Manage your academic schedule with ease. Access your classes, register for courses, and stay organized.
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 3, sm: 4, md: 6 },
          py: 4,
          background: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.default,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 450,
          }}
        >
          {/* Logo for mobile */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              justifyContent: 'center',
              mb: 4,
            }}
          >
            <Logo size={60} variant="compact" color={theme.palette.primary.main} />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: 'text.primary',
            }}
          >
            Sign In
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Enter your credentials to access your account
          </Typography>

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
              fullWidth
              required
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              required
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Remember me checkbox could go here */}
              </Box>
              <Link
                component={RouterLink}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{
                py: 1.5,
                mb: 3,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
            <Box
              sx={{
                textAlign: 'center',
                pt: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
