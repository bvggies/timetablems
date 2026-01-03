import prisma from '../config/database';
import { logger } from '../utils/logger';
import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { env } from '../config/env';

// Initialize SendGrid
if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
}

// Initialize Twilio
let twilioClient: twilio.Twilio | null = null;
if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

export interface NotificationData {
  recipientId: string;
  title: string;
  message: string;
  type: 'TIMETABLE_CHANGE' | 'CLASS_REMINDER' | 'ANNOUNCEMENT' | 'SYSTEM';
  metadata?: any;
  sendEmail?: boolean;
  sendSMS?: boolean;
}

/**
 * Create an in-app notification
 */
export const createNotification = async (data: NotificationData) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        title: data.title,
        message: data.message,
        type: data.type,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    // Send email if requested
    if (data.sendEmail) {
      await sendEmailNotification(data);
    }

    // Send SMS if requested
    if (data.sendSMS) {
      await sendSMSNotification(data);
    }

    return notification;
  } catch (error: any) {
    logger.error('Create notification error', error);
    throw error;
  }
};

/**
 * Send email notification via SendGrid
 */
const sendEmailNotification = async (data: NotificationData) => {
  if (!env.SENDGRID_API_KEY) {
    logger.warn('SendGrid API key not configured, skipping email');
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: data.recipientId },
      select: { email: true, firstName: true },
    });

    if (!user) {
      logger.warn(`User ${data.recipientId} not found for email notification`);
      return;
    }

    const msg = {
      to: user.email,
      from: env.SENDGRID_FROM_EMAIL,
      subject: data.title,
      text: data.message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1976d2;">${data.title}</h2>
          <p>Hello ${user.firstName},</p>
          <p>${data.message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            This is an automated notification from PUG Timetable Management System.
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);
    logger.info(`Email notification sent to ${user.email}`);
  } catch (error: any) {
    logger.error('Send email notification error', error);
    // Don't throw, email failure shouldn't break notification creation
  }
};

/**
 * Send SMS notification via Twilio
 */
const sendSMSNotification = async (data: NotificationData) => {
  if (!twilioClient || !env.TWILIO_PHONE_NUMBER) {
    logger.warn('Twilio not configured, skipping SMS');
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: data.recipientId },
      select: { phone: true, firstName: true },
    });

    if (!user || !user.phone) {
      logger.warn(`User ${data.recipientId} has no phone number for SMS`);
      return;
    }

    const message = `${data.title}: ${data.message}`;

    await twilioClient.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: user.phone,
    });

    logger.info(`SMS notification sent to ${user.phone}`);
  } catch (error: any) {
    logger.error('Send SMS notification error', error);
    // Don't throw, SMS failure shouldn't break notification creation
  }
};

/**
 * Notify users about timetable changes
 */
export const notifyTimetableChange = async (
  sessionId: string,
  changeType: 'CREATED' | 'UPDATED' | 'CANCELLED',
  changes?: { venue?: string; time?: string }
) => {
  try {
    const session = await prisma.timetableSession.findUnique({
      where: { id: sessionId },
      include: {
        Course: true,
        User: true,
        Semester: true,
        Venue: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Get all students registered for this course
    const registrations = await prisma.studentCourseRegistration.findMany({
      where: {
        courseId: session.courseId,
        semesterId: session.semesterId,
        droppedAt: null,
      },
      select: { studentId: true },
    });

    const studentIds = registrations.map((r) => r.studentId);

    // Notify students
    for (const studentId of studentIds) {
      let title = '';
      let message = '';

      switch (changeType) {
        case 'CREATED':
          title = 'New Class Scheduled';
          message = `A new class for ${session.Course.code} has been scheduled on ${getDayName(session.dayOfWeek)} from ${session.startTime} to ${session.endTime} at ${session.Venue.name}.`;
          break;
        case 'UPDATED':
          title = 'Timetable Change';
          message = `Your class ${session.Course.code} has been updated.`;
          if (changes?.venue) {
            message += ` New venue: ${changes.venue}.`;
          }
          if (changes?.time) {
            message += ` New time: ${changes.time}.`;
          }
          break;
        case 'CANCELLED':
          title = 'Class Cancelled';
          message = `Your class ${session.Course.code} scheduled on ${getDayName(session.dayOfWeek)} has been cancelled.`;
          break;
      }

      await createNotification({
        recipientId: studentId,
        title,
        message,
        type: 'TIMETABLE_CHANGE',
        metadata: { sessionId, changeType },
        sendEmail: true,
      });
    }

    // Notify lecturer
    await createNotification({
      recipientId: session.lecturerId,
      title: `Timetable Change - ${session.Course.code}`,
      message: `Your class ${session.Course.code} has been ${changeType.toLowerCase()}.`,
      type: 'TIMETABLE_CHANGE',
      metadata: { sessionId, changeType },
      sendEmail: true,
    });
  } catch (error: any) {
    logger.error('Notify timetable change error', error);
  }
};

const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
};

