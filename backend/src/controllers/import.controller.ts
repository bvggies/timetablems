import { Request, Response } from 'express';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import * as XLSX from 'xlsx';

// Extend Express Request to include multer file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Feature #4: Bulk Import/Export
export const importCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const multerReq = req as MulterRequest;
    if (!multerReq.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const workbook = XLSX.read(multerReq.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const courses = [];
    for (const row of data as any[]) {
      try {
        const course = await prisma.course.create({
          data: {
            code: row.code || row['Course Code'],
            title: row.title || row['Course Title'],
            credits: parseInt(row.credits || row['Credits'] || '3'),
            description: row.description || row['Description'] || null,
            departmentId: row.departmentId || row['Department ID'],
            levelId: row.levelId || row['Level ID'],
            expectedSize: parseInt(row.expectedSize || row['Expected Size'] || '50'),
            updatedAt: new Date(),
          },
        });
        courses.push(course);
      } catch (error: any) {
        logger.error('Error importing course', error);
      }
    }

    res.json({ message: `Imported ${courses.length} courses`, courses });
  } catch (error: any) {
    logger.error('Import courses error', error);
    res.status(500).json({ error: 'Failed to import courses' });
  }
};

export const importVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    const multerReq = req as MulterRequest;
    if (!multerReq.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const workbook = XLSX.read(multerReq.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const venues = [];
    for (const row of data as any[]) {
      try {
        const venue = await prisma.venue.create({
          data: {
            name: row.name || row['Venue Name'],
            location: row.location || row['Location'] || null,
            capacity: parseInt(row.capacity || row['Capacity'] || '50'),
            type: row.type || row['Type'] || 'HALL',
            resources: row.resources ? JSON.stringify(row.resources.split(',').map((r: string) => r.trim())) : null,
            updatedAt: new Date(),
          },
        });
        venues.push(venue);
      } catch (error: any) {
        logger.error('Error importing venue', error);
      }
    }

    res.json({ message: `Imported ${venues.length} venues`, venues });
  } catch (error: any) {
    logger.error('Import venues error', error);
    res.status(500).json({ error: 'Failed to import venues' });
  }
};

export const importUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const multerReq = req as MulterRequest;
    if (!multerReq.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const workbook = XLSX.read(multerReq.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const bcrypt = require('bcrypt');
    const users = [];
    for (const row of data as any[]) {
      try {
        const hashedPassword = await bcrypt.hash(row.password || row['Password'] || 'password123', 10);
        const user = await prisma.user.create({
          data: {
            pugId: row.pugId || row['PUG ID'],
            email: row.email || row['Email'],
            passwordHash: hashedPassword,
            firstName: row.firstName || row['First Name'],
            lastName: row.lastName || row['Last Name'],
            role: row.role || row['Role'] || 'STUDENT',
            departmentId: row.departmentId || row['Department ID'] || null,
            levelId: row.levelId || row['Level ID'] || null,
            status: row.status || row['Status'] || 'ACTIVE',
            updatedAt: new Date(),
          },
        });
        users.push(user);
      } catch (error: any) {
        logger.error('Error importing user', error);
      }
    }

    res.json({ message: `Imported ${users.length} users`, users });
  } catch (error: any) {
    logger.error('Import users error', error);
    res.status(500).json({ error: 'Failed to import users' });
  }
};
