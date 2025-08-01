import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from 'src/config';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.SENDMAIL_EMAIL,
      pass: config.SENDMAIL_PASSWORD,
    },
  });


  async sendMail(to: string, subject: string, text: string) {
    console.log('EMAIL:', config.SENDMAIL_EMAIL);
    console.log('PASSWORD:', config.SENDMAIL_PASSWORD);

    const info = await this.transporter.sendMail({
      from: config.SENDMAIL_EMAIL,
      to,
      subject,
      text,
    });

    console.log('Email sent: %s', info.messageId);
    return info;
  }
}
