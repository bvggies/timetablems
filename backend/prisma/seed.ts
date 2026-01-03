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

  // Create Semester
  const existingSemester = await prisma.semester.findFirst({
    where: {
      year: 2024,
      term: 'Spring',
    },
  });

  const semester = existingSemester || await prisma.semester.create({
    data: {
      year: 2024,
      term: 'Spring',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15'),
      status: 'ACTIVE',
    },
  });

  console.log('✅ Semester created');

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
  const course1 = await prisma.course.create({
    data: {
      code: 'CS101',
      title: 'Introduction to Computer Science',
      credits: 3,
      description: 'Fundamentals of computer science',
      departmentId: dept1.id,
      levelId: level1.id,
      expectedSize: 100,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      code: 'CS201',
      title: 'Data Structures and Algorithms',
      credits: 4,
      description: 'Advanced data structures and algorithm design',
      departmentId: dept1.id,
      levelId: level2.id,
      expectedSize: 80,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      code: 'EE101',
      title: 'Introduction to Electrical Engineering',
      credits: 3,
      description: 'Basic principles of electrical engineering',
      departmentId: dept2.id,
      levelId: level1.id,
      expectedSize: 90,
    },
  });

  console.log('✅ Courses created');

  // Create Course Allocations
  await prisma.courseAllocation.create({
    data: {
      courseId: course1.id,
      lecturerId: lecturer1.id,
      semesterId: semester.id,
    },
  });

  await prisma.courseAllocation.create({
    data: {
      courseId: course2.id,
      lecturerId: lecturer1.id,
      semesterId: semester.id,
    },
  });

  await prisma.courseAllocation.create({
    data: {
      courseId: course3.id,
      lecturerId: lecturer2.id,
      semesterId: semester.id,
    },
  });

  console.log('✅ Course allocations created');

  // Create Student Course Registrations
  await prisma.studentCourseRegistration.create({
    data: {
      studentId: student1.id,
      courseId: course2.id,
      semesterId: semester.id,
    },
  });

  await prisma.studentCourseRegistration.create({
    data: {
      studentId: student2.id,
      courseId: course2.id,
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

  // Create Sample Timetable Sessions
  await prisma.timetableSession.create({
    data: {
      courseId: course2.id,
      lecturerId: lecturer1.id,
      venueId: venue1.id,
      semesterId: semester.id,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '11:00',
      status: 'PUBLISHED',
      version: 1,
    },
  });

  await prisma.timetableSession.create({
    data: {
      courseId: course3.id,
      lecturerId: lecturer2.id,
      venueId: venue2.id,
      semesterId: semester.id,
      dayOfWeek: 3, // Wednesday
      startTime: '14:00',
      endTime: '16:00',
      status: 'PUBLISHED',
      version: 1,
    },
  });

  console.log('✅ Timetable sessions created');

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
