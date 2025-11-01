import { Injectable } from '@nestjs/common';

@Injectable()
export class DevSmsService {
  async send(to: string, message: string): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(`[DevSmsService] to=${to} msg=${message}`);
  }
}
