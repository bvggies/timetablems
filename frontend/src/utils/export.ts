import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { createEvents, EventAttributes } from 'ics';

export interface TimetableSession {
  id: string;
  course: {
    code: string;
    title: string;
  };
  lecturer: {
    firstName: string;
    lastName: string;
  };
  venue: {
    name: string;
    location?: string;
  };
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  status: string;
}

/**
 * Export timetable to PDF
 */
export const exportToPDF = (sessions: TimetableSession[], title: string = 'Timetable') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const startY = 20;
  let y = startY;

  // Title
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Group by day
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sessionsByDay: { [key: number]: TimetableSession[] } = {};

  sessions.forEach((session) => {
    if (!sessionsByDay[session.dayOfWeek]) {
      sessionsByDay[session.dayOfWeek] = [];
    }
    sessionsByDay[session.dayOfWeek].push(session);
  });

  // Add sessions by day
  Object.keys(sessionsByDay)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach((dayStr) => {
      const day = parseInt(dayStr);
      const daySessions = sessionsByDay[day];

      // Check if we need a new page
      if (y > pageHeight - 40) {
        doc.addPage();
        y = startY;
      }

      // Day header
      doc.setFontSize(14);
      doc.text(days[day], margin, y);
      y += 8;

      // Sessions
      doc.setFontSize(10);
      daySessions.forEach((session) => {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = startY;
        }

        const text = `${session.startTime}-${session.endTime} | ${session.course.code} - ${session.course.title} | ${session.venue.name} | ${session.lecturer.firstName} ${session.lecturer.lastName}`;
        doc.text(text, margin + 5, y);
        y += 6;
      });

      y += 5;
    });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

/**
 * Export timetable to Excel
 */
export const exportToExcel = (sessions: TimetableSession[], title: string = 'Timetable') => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const data = sessions.map((session) => ({
    Day: days[session.dayOfWeek],
    'Start Time': session.startTime,
    'End Time': session.endTime,
    'Course Code': session.course.code,
    'Course Title': session.course.title,
    Lecturer: `${session.lecturer.firstName} ${session.lecturer.lastName}`,
    Venue: session.venue.name,
    Location: session.venue.location || '',
    Status: session.status,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Timetable');

  // Auto-size columns
  const colWidths = [
    { wch: 12 }, // Day
    { wch: 10 }, // Start Time
    { wch: 10 }, // End Time
    { wch: 12 }, // Course Code
    { wch: 30 }, // Course Title
    { wch: 20 }, // Lecturer
    { wch: 15 }, // Venue
    { wch: 20 }, // Location
    { wch: 10 }, // Status
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
};

/**
 * Export timetable to CSV
 */
export const exportToCSV = (sessions: TimetableSession[], title: string = 'Timetable') => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const headers = [
    'Day',
    'Start Time',
    'End Time',
    'Course Code',
    'Course Title',
    'Lecturer',
    'Venue',
    'Location',
    'Status',
  ];

  const rows = sessions.map((session) => [
    days[session.dayOfWeek],
    session.startTime,
    session.endTime,
    session.course.code,
    session.course.title,
    `${session.lecturer.firstName} ${session.lecturer.lastName}`,
    session.venue.name,
    session.venue.location || '',
    session.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/\s+/g, '_')}.csv`;
  link.click();
};

/**
 * Export timetable to ICS (iCalendar) format
 */
export const exportToICS = async (
  sessions: TimetableSession[],
  title: string = 'Timetable',
  semesterStartDate?: Date
) => {
  const events: EventAttributes[] = [];

  sessions.forEach((session) => {
    if (!semesterStartDate) {
      // Use current date as fallback
      semesterStartDate = new Date();
    }

    // Calculate the date for this session
    const sessionDate = new Date(semesterStartDate);
    const daysToAdd = session.dayOfWeek - sessionDate.getDay();
    sessionDate.setDate(sessionDate.getDate() + daysToAdd);

    // Parse time
    const [startHour, startMinute] = session.startTime.split(':').map(Number);
    const [endHour, endMinute] = session.endTime.split(':').map(Number);

    const startDateTime = new Date(sessionDate);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(sessionDate);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    events.push({
      title: `${session.course.code} - ${session.course.title}`,
      description: `Lecturer: ${session.lecturer.firstName} ${session.lecturer.lastName}\nVenue: ${session.venue.name}${session.venue.location ? ` (${session.venue.location})` : ''}`,
      location: session.venue.name + (session.venue.location ? `, ${session.venue.location}` : ''),
      start: [
        startDateTime.getFullYear(),
        startDateTime.getMonth() + 1,
        startDateTime.getDate(),
        startDateTime.getHours(),
        startDateTime.getMinutes(),
      ],
      end: [
        endDateTime.getFullYear(),
        endDateTime.getMonth() + 1,
        endDateTime.getDate(),
        endDateTime.getHours(),
        endDateTime.getMinutes(),
      ],
      recurrenceRule: 'FREQ=WEEKLY;COUNT=15', // Weekly for 15 weeks (typical semester)
    });
  });

  const { error, value } = await createEvents(events);

  if (error) {
    console.error('Error creating ICS file:', error);
    throw error;
  }

  if (value) {
    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.replace(/\s+/g, '_')}.ics`;
    link.click();
  }
};

