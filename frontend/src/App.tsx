import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { lightTheme, darkTheme } from './theme/theme';
import { queryClient } from './store/queryClient';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
// Feature #19: Performance - Lazy loading for better performance
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
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import CalendarPage from './pages/Calendar';
import ResourceBooking from './pages/ResourceBooking';
import StudentGroups from './pages/StudentGroups';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import TimetableVersions from './pages/admin/TimetableVersions';
import SystemHealth from './pages/admin/SystemHealth';
import Integrations from './pages/admin/Integrations';
import LecturerTimetable from './pages/LecturerTimetable';
import LecturerStudents from './pages/LecturerStudents';
import { CircularProgress, Box } from '@mui/material';

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
                      <Route path="/timetable/my-sessions" element={<LecturerTimetable />} />
                      <Route path="/courses/my-students" element={<LecturerStudents />} />
                      <Route path="/courses" element={<Courses />} />
                      <Route path="/courses/register" element={<StudentCourseRegistration />} />
                      <Route path="/venues" element={<Venues />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/exams" element={<Exams />} />
                      <Route path="/support" element={<Support />} />
                      <Route path="/help" element={<Help />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/resources" element={<ResourceBooking />} />
                      <Route path="/student-groups" element={<StudentGroups />} />
                      <Route path="/announcements" element={<Announcements />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/timetable/versions" element={<TimetableVersions />} />
                      <Route path="/admin/health" element={<SystemHealth />} />
                      <Route path="/admin/integrations" element={<Integrations />} />
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

