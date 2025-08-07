import cron from 'node-cron';
import { storage } from '../storage';
import { emailService } from './emailService';

export class ReminderScheduler {
  private isRunning = false;

  start() {
    if (this.isRunning) return;

    // Check for reminders every minute
    cron.schedule('* * * * *', async () => {
      await this.checkReminders();
    });

    this.isRunning = true;
    console.log('Reminder scheduler started');
  }

  private async checkReminders() {
    try {
      const movies = await storage.getAllMovies();
      const now = new Date();

      for (const movie of movies) {
        const reminderDateTime = new Date(`${movie.reminderDate} ${movie.reminderTime}`);
        
        // Check if reminder time has passed within the last minute
        const timeDiff = now.getTime() - reminderDateTime.getTime();
        const oneMinute = 60 * 1000;

        if (timeDiff >= 0 && timeDiff < oneMinute) {
          await this.sendReminder(movie);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  private async sendReminder(movie: any) {
    try {
      const emailData = {
        to: movie.userEmail,
        movieTitle: movie.title,
        reminderDate: movie.reminderDate,
        reminderTime: movie.reminderTime,
      };

      const success = await emailService.sendReminderEmail(emailData);
      
      if (success) {
        console.log(`Reminder sent for movie: ${movie.title} to ${movie.userEmail}`);
      } else {
        console.error(`Failed to send reminder for movie: ${movie.title}`);
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }
}

export const reminderScheduler = new ReminderScheduler();
