import { Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggingService } from 'src/internals/logging/logging.service';
import { AppServerHttpAdapter } from 'src/internals/server/types/app-server-http-adapter-types';
import { EmailService } from '../email.service';

@Injectable()
export class ProdEmailService extends EmailService {
  constructor(
    private loggingService: LoggingService,
    private httpAdapterHost: HttpAdapterHost<AppServerHttpAdapter>,
  ) {
    super();
  }

  async sendEmail(): Promise<void> {
    throw new Error();
  }
}
