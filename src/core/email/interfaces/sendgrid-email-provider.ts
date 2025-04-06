import * as sgMail from "@sendgrid/mail";
import { EmailProvider } from "./email-provider.interface";
import * as fs from "fs";
import * as path from "path";
import * as Handlebars from "handlebars";

const juice = require("juice");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export class SendGridEmailProvider implements EmailProvider {
  async sendEmail(
    to: string,
    subject: string,
    data: any,
    templateName: string,
  ): Promise<void> {
    const filePath = path.join(
      process.cwd(),
      `/src/core/email/tamplates/${templateName}.hbs`,
    );
    const source = fs.readFileSync(filePath, "utf8");
    const template = Handlebars.compile(source);
    const html = template(data);

    const inlinedHtml: string = juice(html);

    const msg = {
      to,
      from: process.env.SENDER_EMAIL!,
      subject,
      html: inlinedHtml,
    };

    try {
      await sgMail.send(msg);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error.response.body);
    }
  }
}
