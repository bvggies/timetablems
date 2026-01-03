import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { lightTheme, darkTheme } from './theme/theme';
import { queryClient } from './store/queryClient';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Timetable from './pages/Timetable';
import Notifications from './pages/Notifications';
import Courses from './pages/Courses';
import Venues from './pages/Venues';
import TimetableManagement from './pages/admin/TimetableManagement';
import StudentCourseRegistration from './pages/StudentCourseRegistration';
import Reports from './pages/admin/Reports';
import Exams from './pages/Exams';
import Support from './pages/Support';
import Help from './pages/Help';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || false
  );

  const theme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout isDarkMode={isDarkMode} onThemeToggle={handleThemeToggle}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/timetable" element={<Timetable />} />
                      <Route path="/timetable/manage" element={<TimetableManagement />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/courses/register" element={<StudentCourseRegistration />} />
                      <Route path="/venues" element={<Venues />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/exams" element={<Exams />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="*" element={<div>Page not found</div>} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

