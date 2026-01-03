import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Departments
  const dept1 = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: {
      code: 'CS',
      name: 'Computer Science',
      description: 'Department of Computer Science',
    },
  });

  const dept2 = await prisma.department.upsert({
    where: { code: 'EE' },
    update: {},
    create: {
      code: 'EE',
      name: 'Electrical Engineering',
      description: 'Department of Electrical Engineering',
    },
  });

  console.log('✅ Departments created');

  // Create Levels
  const level1 = await prisma.level.upsert({
    where: { code: '100' },
    update: {},
    create: {
      code: '100',
      name: 'Level 100',
      description: 'First Year',
    },
  });

  const level2 = await prisma.level.upsert({
    where: { code: '200' },
    update: {},
    create: {
      code: '200',
      name: 'Level 200',
      description: 'Second Year',
    },
  });

  const level3 = await prisma.level.upsert({
    where: { code: '300' },
    update: {},
    create: {
      code: '300',
      name: 'Level 300',
      description: 'Third Year',
    },
  });

  console.log('✅ Levels created');

  // Create Semester for next 3 months
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (today.getDay() || 7) + 1); // Start from this Monday
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 3); // 3 months from start

  const semesterYear = startDate.getFullYear();
  const semesterTerm = startDate.getMonth() < 6 ? 'Spring' : 'Fall';

  const existingSemester = await prisma.semester.findFirst({
    where: {
      year: semesterYear,
      term: semesterTerm,
    },
  });

  const semester = existingSemester || await prisma.semester.create({
    data: {
      year: semesterYear,
      term: semesterTerm,
      startDate: startDate,
      endDate: endDate,
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Semester created (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})`);

  // Create Venues
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Main Hall A',
      location: 'Building 1, Floor 2',
      capacity: 200,
      type: 'HALL',
      resources: JSON.stringify(['projector', 'whiteboard', 'sound-system']),
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Lab 1',
      location: 'Building 2, Floor 1',
      capacity: 50,
      type: 'LAB',
      resources: JSON.stringify(['computers', 'projector']),
    },
  });

  const venue3 = await prisma.venue.create({
    data: {
      name: 'Seminar Room B',
      location: 'Building 1, Floor 3',
      capacity: 30,
      type: 'SEMINAR',
      resources: JSON.stringify(['projector', 'whiteboard']),
    },
  });

  console.log('✅ Venues created');

  // Create Admin User
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pug.edu' },
    update: {},
    create: {
      pugId: 'ADMIN001',
      email: 'admin@pug.edu',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      status: 'ACTIVE',
      departmentId: dept1.id,
    },
  });

  console.log('✅ Admin user created (admin@pug.edu / admin123)');

  // Create Lecturer Users
  const lecturer1Password = await hashPassword('lecturer123');
  const lecturer1 = await prisma.user.upsert({
    where: { email: 'lecturer1@pug.edu' },
    update: {},
    create: {
      pugId: 'LEC001',
      email: 'lecturer1@pug.edu',
      passwordHash: lecturer1Password,
      firstName: 'John',
      lastName: 'Lecturer',
      role: 'LECTURER',
      status: 'ACTIVE',
      departmentId: dept1.id,
    },
  });

  const lecturer2Password = await hashPassword('lecturer123');
  const lecturer2 = await prisma.user.upsert({
    where: { email: 'lecturer2@pug.edu' },
    update: {},
    create: {
      pugId: 'LEC002',
      email: 'lecturer2@pug.edu',
      passwordHash: lecturer2Password,
      firstName: 'Jane',
      lastName: 'Professor',
      role: 'LECTURER',
      status: 'ACTIVE',
      departmentId: dept2.id,
    },
  });

  console.log('✅ Lecturer users created (lecturer1@pug.edu / lecturer123)');

  // Create Student Users
  const student1Password = await hashPassword('student123');
  const student1 = await prisma.user.upsert({
    where: { email: 'student1@pug.edu' },
    update: {},
    create: {
      pugId: 'STU001',
      email: 'student1@pug.edu',
      passwordHash: student1Password,
      firstName: 'Alice',
      lastName: 'Student',
      role: 'STUDENT',
      status: 'ACTIVE',
      departmentId: dept1.id,
      levelId: level2.id,
    },
  });

  const student2Password = await hashPassword('student123');
  const student2 = await prisma.user.upsert({
    where: { email: 'student2@pug.edu' },
    update: {},
    create: {
      pugId: 'STU002',
      email: 'student2@pug.edu',
      passwordHash: student2Password,
      firstName: 'Bob',
      lastName: 'Learner',
      role: 'STUDENT',
      status: 'ACTIVE',
      departmentId: dept1.id,
      levelId: level2.id,
    },
  });

  console.log('✅ Student users created (student1@pug.edu / student123)');

  // Create Courses
  const course1 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      code: 'CS101',
      title: 'Introduction to Computer Science',
      credits: 3,
      description: 'Fundamentals of computer science',
      departmentId: dept1.id,
      levelId: level1.id,
      expectedSize: 100,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { code: 'CS201' },
    update: {},
    create: {
      code: 'CS201',
      title: 'Data Structures and Algorithms',
      credits: 4,
      description: 'Advanced data structures and algorithm design',
      departmentId: dept1.id,
      levelId: level2.id,
      expectedSize: 80,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { code: 'EE101' },
    update: {},
    create: {
      code: 'EE101',
      title: 'Introduction to Electrical Engineering',
      credits: 3,
      description: 'Basic principles of electrical engineering',
      departmentId: dept2.id,
      levelId: level1.id,
      expectedSize: 90,
    },
  });

  const course4 = await prisma.course.upsert({
    where: { code: 'CS301' },
    update: {},
    create: {
      code: 'CS301',
      title: 'Database Systems',
      credits: 3,
      description: 'Database design and management',
      departmentId: dept1.id,
      levelId: level3.id,
      expectedSize: 60,
    },
  });

  const course5 = await prisma.course.upsert({
    where: { code: 'CS202' },
    update: {},
    create: {
      code: 'CS202',
      title: 'Object-Oriented Programming',
      credits: 3,
      description: 'Advanced OOP concepts and design patterns',
      departmentId: dept1.id,
      levelId: level2.id,
      expectedSize: 75,
    },
  });

  const course6 = await prisma.course.upsert({
    where: { code: 'EE201' },
    update: {},
    create: {
      code: 'EE201',
      title: 'Circuit Analysis',
      credits: 4,
      description: 'Analysis of electrical circuits',
      departmentId: dept2.id,
      levelId: level2.id,
      expectedSize: 70,
    },
  });

  console.log('✅ Courses created');

  // Create Course Allocations
  await prisma.courseAllocation.upsert({
    where: {
      courseId_semesterId: {
        courseId: course1.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      courseId: course1.id,
      lecturerId: lecturer1.id,
      semesterId: semester.id,
    },
  });

  await prisma.courseAllocation.upsert({
    where: {
      courseId_semesterId: {
        courseId: course2.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      courseId: course2.id,
      lecturerId: lecturer1.id,
      semesterId: semester.id,
    },
  });

  await prisma.courseAllocation.upsert({
    where: {
      courseId_semesterId: {
        courseId: course3.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      courseId: course3.id,
      lecturerId: lecturer2.id,
      semesterId: semester.id,
    },
  });

  await prisma.courseAllocation.upsert({
    where: {
      courseId_semesterId: {
        courseId: course4.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      courseId: course4.id,
      lecturerId: lecturer1.id,
      semesterId: semester.id,
    },
  });

  await prisma.courseAllocation.upsert({
    where: {
      courseId_semesterId: {
        courseId: course5.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      courseId: course5.id,
      lecturerId: lecturer1.id,
      semesterId: semester.id,
    },
  });

  await prisma.courseAllocation.upsert({
    where: {
      courseId_semesterId: {
        courseId: course6.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      courseId: course6.id,
      lecturerId: lecturer2.id,
      semesterId: semester.id,
    },
  });

  console.log('✅ Course allocations created');

  // Create Student Course Registrations
  await prisma.studentCourseRegistration.upsert({
    where: {
      studentId_courseId_semesterId: {
        studentId: student1.id,
        courseId: course2.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      courseId: course2.id,
      semesterId: semester.id,
    },
  });

  await prisma.studentCourseRegistration.upsert({
    where: {
      studentId_courseId_semesterId: {
        studentId: student1.id,
        courseId: course5.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      courseId: course5.id,
      semesterId: semester.id,
    },
  });

  await prisma.studentCourseRegistration.upsert({
    where: {
      studentId_courseId_semesterId: {
        studentId: student2.id,
        courseId: course2.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      studentId: student2.id,
      courseId: course2.id,
      semesterId: semester.id,
    },
  });

  await prisma.studentCourseRegistration.upsert({
    where: {
      studentId_courseId_semesterId: {
        studentId: student2.id,
        courseId: course5.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      studentId: student2.id,
      courseId: course5.id,
      semesterId: semester.id,
    },
  });

  console.log('✅ Student registrations created');

  // Create Lecturer Availability
  await prisma.lecturerAvailability.createMany({
    data: [
      {
        lecturerId: lecturer1.id,
        dayOfWeek: 1, // Monday
        startTime: '08:00',
        endTime: '17:00',
      },
      {
        lecturerId: lecturer1.id,
        dayOfWeek: 2, // Tuesday
        startTime: '08:00',
        endTime: '17:00',
      },
      {
        lecturerId: lecturer1.id,
        dayOfWeek: 3, // Wednesday
        startTime: '08:00',
        endTime: '17:00',
      },
      {
        lecturerId: lecturer2.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '16:00',
      },
      {
        lecturerId: lecturer2.id,
        dayOfWeek: 3, // Wednesday
        startTime: '09:00',
        endTime: '16:00',
      },
    ],
  });

  console.log('✅ Lecturer availability created');

  // Delete existing timetable sessions for this semester to avoid duplicates
  await prisma.timetableSession.deleteMany({
    where: { semesterId: semester.id },
  });

  // Create Timetable Sessions for the next 3 months
  // These represent weekly recurring classes
  const timetableSessions = [
    // CS201 - Data Structures (Monday & Wednesday)
    {
      courseId: course2.id,
      lecturerId: lecturer1.id,
      venueId: venue1.id,
      semesterId: semester.id,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '11:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Weekly lecture session',
    },
    {
      courseId: course2.id,
      lecturerId: lecturer1.id,
      venueId: venue2.id,
      semesterId: semester.id,
      dayOfWeek: 3, // Wednesday
      startTime: '14:00',
      endTime: '16:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Lab session',
    },
    // CS202 - Object-Oriented Programming (Tuesday & Thursday)
    {
      courseId: course5.id,
      lecturerId: lecturer1.id,
      venueId: venue1.id,
      semesterId: semester.id,
      dayOfWeek: 2, // Tuesday
      startTime: '10:00',
      endTime: '12:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Weekly lecture',
    },
    {
      courseId: course5.id,
      lecturerId: lecturer1.id,
      venueId: venue2.id,
      semesterId: semester.id,
      dayOfWeek: 4, // Thursday
      startTime: '13:00',
      endTime: '15:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Practical session',
    },
    // CS101 - Intro to CS (Monday & Friday)
    {
      courseId: course1.id,
      lecturerId: lecturer1.id,
      venueId: venue1.id,
      semesterId: semester.id,
      dayOfWeek: 1, // Monday
      startTime: '13:00',
      endTime: '15:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Introduction lecture',
    },
    {
      courseId: course1.id,
      lecturerId: lecturer1.id,
      venueId: venue3.id,
      semesterId: semester.id,
      dayOfWeek: 5, // Friday
      startTime: '10:00',
      endTime: '12:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Tutorial session',
    },
    // CS301 - Database Systems (Wednesday)
    {
      courseId: course4.id,
      lecturerId: lecturer1.id,
      venueId: venue1.id,
      semesterId: semester.id,
      dayOfWeek: 3, // Wednesday
      startTime: '09:00',
      endTime: '12:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Database systems lecture',
    },
    // EE101 - Intro to EE (Tuesday & Thursday)
    {
      courseId: course3.id,
      lecturerId: lecturer2.id,
      venueId: venue2.id,
      semesterId: semester.id,
      dayOfWeek: 2, // Tuesday
      startTime: '14:00',
      endTime: '16:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Electrical engineering basics',
    },
    {
      courseId: course3.id,
      lecturerId: lecturer2.id,
      venueId: venue2.id,
      semesterId: semester.id,
      dayOfWeek: 4, // Thursday
      startTime: '09:00',
      endTime: '11:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Lab session',
    },
    // EE201 - Circuit Analysis (Monday & Wednesday)
    {
      courseId: course6.id,
      lecturerId: lecturer2.id,
      venueId: venue3.id,
      semesterId: semester.id,
      dayOfWeek: 1, // Monday
      startTime: '15:00',
      endTime: '17:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Circuit analysis lecture',
    },
    {
      courseId: course6.id,
      lecturerId: lecturer2.id,
      venueId: venue2.id,
      semesterId: semester.id,
      dayOfWeek: 3, // Wednesday
      startTime: '10:00',
      endTime: '12:00',
      status: 'PUBLISHED' as const,
      version: 1,
      notes: 'Practical circuit analysis',
    },
  ];

  await prisma.timetableSession.createMany({
    data: timetableSessions,
  });

  console.log(`✅ ${timetableSessions.length} Timetable sessions created`);

  // Create Exam Sessions for mid-term and final exams
  const examDate1 = new Date(startDate);
  examDate1.setDate(examDate1.getDate() + 45); // Mid-term exam after ~6 weeks

  const examDate2 = new Date(startDate);
  examDate2.setDate(examDate2.getDate() + 90); // Final exam after ~12 weeks

  const examSessions = [
    // Mid-term exams
    {
      courseId: course2.id,
      venueId: venue1.id,
      semesterId: semester.id,
      date: examDate1,
      startTime: '09:00',
      endTime: '12:00',
      duration: 180, // 3 hours
      notes: 'Mid-term examination',
    },
    {
      courseId: course5.id,
      venueId: venue1.id,
      semesterId: semester.id,
      date: examDate1,
      startTime: '14:00',
      endTime: '17:00',
      duration: 180,
      notes: 'Mid-term examination',
    },
    {
      courseId: course3.id,
      venueId: venue2.id,
      semesterId: semester.id,
      date: examDate1,
      startTime: '09:00',
      endTime: '12:00',
      duration: 180,
      notes: 'Mid-term examination',
    },
    // Final exams
    {
      courseId: course2.id,
      venueId: venue1.id,
      semesterId: semester.id,
      date: examDate2,
      startTime: '09:00',
      endTime: '12:00',
      duration: 180,
      notes: 'Final examination',
    },
    {
      courseId: course5.id,
      venueId: venue1.id,
      semesterId: semester.id,
      date: examDate2,
      startTime: '14:00',
      endTime: '17:00',
      duration: 180,
      notes: 'Final examination',
    },
    {
      courseId: course3.id,
      venueId: venue2.id,
      semesterId: semester.id,
      date: examDate2,
      startTime: '09:00',
      endTime: '12:00',
      duration: 180,
      notes: 'Final examination',
    },
    {
      courseId: course6.id,
      venueId: venue3.id,
      semesterId: semester.id,
      date: examDate2,
      startTime: '14:00',
      endTime: '17:00',
      duration: 180,
      notes: 'Final examination',
    },
  ];

  await prisma.examSession.createMany({
    data: examSessions,
  });

  console.log(`✅ ${examSessions.length} Exam sessions created`);

  console.log('🎉 Seed completed successfully!');
  console.log('\n📝 Demo Accounts:');
  console.log('Admin: admin@pug.edu / admin123');
  console.log('Lecturer: lecturer1@pug.edu / lecturer123');
  console.log('Student: student1@pug.edu / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
