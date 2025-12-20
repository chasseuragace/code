import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { sendSmsNotificationDto } from './dto/send-sms-notification.dto';

export type OtpContext =
  | 'candidate_register'
  | 'candidate_login'
  | 'owner_register'
  | 'owner_login'
  | 'member_login'
  | 'phone_change';

export function buildOtpSmsMessage(context: OtpContext, otp: string): string {
  switch (context) {
    case 'candidate_register':
      return `Your Sarathi verification code is ${otp}. It will expire in 5 minutes.`;
    case 'candidate_login':
      return `Your Sarathi login code is ${otp}. It will expire in 5 minutes.`;
    case 'owner_register':
      return `Your Sarathi owner verification code is ${otp}. It will expire in 5 minutes.`;
    case 'owner_login':
      return `Your Sarathi owner login code is ${otp}. It will expire in 5 minutes.`;
    case 'member_login':
      return `Your Sarathi member login code is ${otp}. It will expire in 5 minutes.`;
    case 'phone_change':
      return `Your Sarathi phone change code is ${otp}. It will expire in 5 minutes.`;
  }
}

@Injectable()
export class SmsService {
  private readonly token = process.env.SMS_TOKEN;
  private readonly url = process.env.SMS_URL || 'https://sms.aakashsms.com/sms/v3/send/';

  public async sendSmsNotification(body: sendSmsNotificationDto) {
    if (!this.token || !this.url) {
      // eslint-disable-next-line no-console
      console.log('SMS_TOKEN or SMS_URL not configured; skipping SMS send');
      return;
    }

    const params = new URLSearchParams({
      auth_token: this.token,
      to: body.contactNumber,
      text: body.message,
    }).toString();

    try {
      await axios.post(this.url, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Failed to send SMS', { err });
    }
  }
}
