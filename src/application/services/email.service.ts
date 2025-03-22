import * as nodemailer from 'nodemailer';
import { MailerException } from '../exceptions/mailer.exception';

export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.HOST_MAIL, 
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"Blog Post Management System" <${process.env.SENDER_MAIL}>`,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      throw new MailerException();
    }
  }
}
