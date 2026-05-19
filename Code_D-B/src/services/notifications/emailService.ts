import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { logger } from '../../utils';

const TEMPLATE_DIR = path.join(__dirname, '../../templates/emails');

/**
 * Loads an HTML email template and replaces {{token}} placeholders.
 */
const loadTemplate = (
  templateName: string,
  tokens: Record<string, string> = {}
): string => {
  const filePath = path.join(TEMPLATE_DIR, `${templateName}.html`);
  let html = fs.readFileSync(filePath, 'utf8');
  for (const [key, value] of Object.entries(tokens)) {
    html = html.replaceAll(`{{${key}}}`, value ?? '');
  }
  return html;
};

interface SendParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send({ to, subject, html, text }: SendParams): Promise<void> {
    if (!process.env.EMAIL_USER) {
      logger.warn(`EmailService: EMAIL_USER not set — skipping email to ${to}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: `"Academ OS" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''), // plain-text fallback
      });
      logger.info(`EmailService: Sent "${subject}" to ${to}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`EmailService: Failed to send to ${to}: ${message}`);
    }
  }

  // ─── OTP Verification ────────────────────────────────────────────────────────
  async sendVerificationOtp(userEmail: string, userName: string, otp: string): Promise<void> {
    const html = loadTemplate('otpVerificationEmail', { name: userName, otp });
    await this.send({
      to: userEmail,
      subject: `${otp} is your Academ OS verification code`,
      html,
    });
  }

  // ── Specific senders ────────────────────────────────────────────────────────

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const html = loadTemplate('welcomeEmail', { name: userName });
    await this.send({ to: userEmail, subject: 'Welcome to Code DB!', html });
  }

  async sendWeeklyProgressEmail(
    userEmail: string,
    progressData: any
  ): Promise<void> {
    const completedCount = progressData.completedTasks?.length ?? 0;
    const totalCount = progressData.roadmapId?.tasks?.length ?? 0;
    const percentage =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const html = loadTemplate('weeklyProgressEmail', {
      name: progressData.studentName || 'Student',
      score: String(percentage),
      completed: String(completedCount),
      total: String(totalCount),
      week: String(progressData.roadmapId?.weekNumber ?? '—'),
      link: process.env.FRONTEND_URL || 'http://localhost:3000',
    });
    await this.send({
      to: userEmail,
      subject: 'Your Weekly Progress Report',
      html,
    });
  }

  async sendRoadmapReminderEmail(
    userEmail: string,
    roadmapData: any
  ): Promise<void> {
    const html = loadTemplate('roadmapReminderEmail', {
      week: String(roadmapData.weekNumber),
      pending: String(roadmapData.pendingCount ?? ''),
      link: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/roadmap`,
    });
    await this.send({
      to: userEmail,
      subject: `Week ${roadmapData.weekNumber} Roadmap Reminder`,
      html,
    });
  }

  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string
  ): Promise<void> {
    const resetLink = `${
      process.env.FRONTEND_URL || 'http://localhost:3000'
    }/reset-password?token=${resetToken}`;
    const html = loadTemplate('passwordResetEmail', {
      link: resetLink,
      expiry: '10 minutes',
    });
    await this.send({
      to: userEmail,
      subject: 'Password Reset Request — Code DB',
      html,
    });
  }

  async sendHodPasswordResetOtp(
    hodEmail: string,
    hodName: string,
    otp: string
  ): Promise<void> {
    const html = loadTemplate('hodPasswordResetEmail', {
      name: hodName,
      otp,
    });
    await this.send({
      to: hodEmail,
      subject: `🔐 ${otp} — Your HOD Password Reset Code`,
      html,
    });
  }

  async sendLowPerformerAlert(
    hodEmail: string,
    studentData: any
  ): Promise<void> {
    const html = loadTemplate('lowPerformerAlertEmail', {
      hodName: studentData.hodName || 'HOD',
      studentName: studentData.name || 'Unknown Student',
      score: String(studentData.score ?? 0),
      grade: studentData.grade || 'F',
      link: `${
        process.env.FRONTEND_URL || 'http://localhost:3000'
      }/hod/students/${studentData.studentId}`,
    });
    await this.send({
      to: hodEmail,
      subject: `⚠️ Low Performer Alert: ${studentData.name}`,
      html,
    });
  }
}

export default new EmailService();
