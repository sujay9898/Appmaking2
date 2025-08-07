import nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  movieTitle: string;
  reminderDate: string;
  reminderTime: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.setupTransporter();
  }

  private setupTransporter() {
    const gmailUser = process.env.GMAIL_USER || process.env.EMAIL_USER || '';
    const gmailPass = process.env.GMAIL_PASS || process.env.EMAIL_PASS || '';

    if (!gmailUser || !gmailPass) {
      console.warn('Gmail credentials not found. Email reminders will not work.');
      return;
    }

    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass, // Use app password for Gmail
      },
    });
  }

  async sendReminderEmail(emailData: EmailData): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.GMAIL_USER || process.env.EMAIL_USER,
        to: emailData.to,
        subject: `🎬 Movie Reminder: ${emailData.movieTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">MovieWatch Reminder</h2>
            <p>Hi there!</p>
            <p>This is your reminder to watch <strong>${emailData.movieTitle}</strong>.</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">📅 Scheduled for:</h3>
              <p style="margin: 0; font-size: 18px; color: #1f2937;">
                ${emailData.reminderDate} at ${emailData.reminderTime}
              </p>
            </div>
            <p>Enjoy your movie! 🍿</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              This reminder was sent from your MovieWatch watchlist.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${emailData.to} for ${emailData.movieTitle}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) return false;

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
