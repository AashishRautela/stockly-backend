import { Injectable } from '@nestjs/common';
import { CreateEmailOptions, Resend } from 'resend';
import { AppError } from 'src/common/errors/app-error';

export type MailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly resendClient: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new AppError('Resend API key is missing', 500);
    }

    this.resendClient = new Resend(apiKey);
  }

  async sendMail(mail: MailPayload) {
    try {
      await this.resendClient.emails.send(mail as CreateEmailOptions);
    } catch {
      throw new AppError('Failed to send email', 500, [
        'The email provider rejected the request',
      ]);
    }
  }
}
