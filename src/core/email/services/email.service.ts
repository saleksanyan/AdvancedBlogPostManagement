import { EmailProvider } from "../interfaces/email-provider.interface";

export class EmailService {
  constructor(private readonly provider: EmailProvider) {}

  async sendEmail(
    email: string,
    data: any,
    fileName: string,
    subject: string,
  ): Promise<void> {
    await this.provider.sendEmail(email, subject, data, fileName);
  }
}
