import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Book as BookIcon,
} from '@mui/icons-material';

const Help: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const faqs = [
    {
      question: 'How do I view my timetable?',
      answer:
        'Navigate to the "Timetable" page from the sidebar. Your timetable will show all classes for courses you have registered for in the current semester.',
    },
    {
      question: 'How do I register for courses?',
      answer:
        'Go to "Register Courses" from the sidebar (Students only). Browse available courses and click "Register" on the courses you want to take. You can also drop courses if needed.',
    },
    {
      question: 'Can I export my timetable?',
      answer:
        'Yes! On the Timetable page, click the "Export" button. You can export to PDF, Excel, CSV, or ICS format (for calendar apps like Google Calendar).',
    },
    {
      question: 'What should I do if I see a conflict in my timetable?',
      answer:
        'Contact your academic advisor or submit a support ticket through the "Help & Support" page. Administrators will review and resolve the conflict.',
    },
    {
      question: 'How do I view exam schedules?',
      answer:
        'Navigate to the "Exams" page from the sidebar. All exam schedules for the current semester will be displayed, grouped by date.',
    },
    {
      question: 'How do I receive notifications?',
      answer:
        'Notifications are automatically sent when there are timetable changes, class reminders, or announcements. Check the notification bell icon in the top bar or visit the "Notifications" page.',
    },
    {
      question: 'Can I change my password?',
      answer:
        'Currently, password changes must be requested through support. Contact the administrator or submit a support ticket.',
    },
    {
      question: 'What if I forget my password?',
      answer:
        'Use the "Forgot Password" link on the login page. You will receive an email with instructions to reset your password.',
    },
  ];

  const quickLinks = [
    { title: 'View Timetable', description: 'See your class schedule', icon: <BookIcon /> },
    {
      title: 'Register Courses',
      description: 'Enroll in courses for the semester',
      icon: <QuestionAnswerIcon />,
    },
    {
      title: 'Check Exams',
      description: 'View exam schedules',
      icon: <HelpIcon />,
    },
    {
      title: 'Get Support',
      description: 'Submit a support ticket',
      icon: <HelpIcon />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Help & User Guide
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Find answers to common questions and learn how to use the system
      </Typography>

      {/* Quick Links */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickLinks.map((link, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 1 }}>{link.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {link.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {link.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Getting Started */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Getting Started
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="1. Login to your account"
              secondary="Use your PUG email and password to access the system"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="2. Register for courses"
              secondary="Navigate to 'Register Courses' and select the courses you want to take"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="3. View your timetable"
              secondary="Once registered, your timetable will automatically show your classes"
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText
              primary="4. Export your schedule"
              secondary="Download your timetable in PDF, Excel, or add it to your calendar"
            />
          </ListItem>
        </List>
      </Paper>

      {/* FAQ Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Frequently Asked Questions (FAQ)
        </Typography>
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight="medium">
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Contact Support */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
        <Typography variant="h6" gutterBottom>
          Need More Help?
        </Typography>
        <Typography variant="body2">
          If you can't find the answer you're looking for, please submit a support ticket through
          the "Help & Support" page. Our team will respond as soon as possible.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Help;

