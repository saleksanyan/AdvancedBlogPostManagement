export interface EmailProvider {
  sendEmail(
    to: string,
    subject: string,
    data: any,
    templateName: string,
  ): Promise<void>;
}
