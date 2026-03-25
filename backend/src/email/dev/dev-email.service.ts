import util from 'util';
import fs from 'fs';
import path from 'path';
import { LOCAL_TEMPORARY_FILES_PATH } from 'src/temporary-files/temporary-files';
import { Email, EmailService } from '../email.service';
import { LoggingService } from 'src/logging/logging.service';
import { generateRandomUUID } from 'src/uuids/generate-random-uuid';
import { throwError } from 'src/throw-error';
import { HttpAdapterHost } from '@nestjs/core';
import { AppServerHttpAdapter } from 'src/server/types/app-server-http-adapter-types';
import { Injectable } from '@nestjs/common';

const writeFile = util.promisify(fs.writeFile);
const mkDir = util.promisify(fs.mkdir);

@Injectable()
export class DevEmailService extends EmailService {
  constructor(
    private loggingService: LoggingService,
    private httpAdapterHost: HttpAdapterHost<AppServerHttpAdapter>,
  ) {
    super();
  }

  async sendEmail(email: Email): Promise<void> {
    const emailsDirectoryPath = path.join(
      LOCAL_TEMPORARY_FILES_PATH,
      'dev-email',
    );

    await mkDir(emailsDirectoryPath, { recursive: true });

    const emailFileName = `${generateRandomUUID()}.html`;
    const emailPath = path.join(emailsDirectoryPath, emailFileName);

    await writeFile(emailPath, this.renderEmail(email), { encoding: 'utf8' });

    const address = this.httpAdapterHost.httpAdapter.getHttpServer().address();

    const port =
      address === null || typeof address === 'string'
        ? throwError()
        : address.port;

    this.loggingService.logInfo(
      'dev-email-service:send-mail',
      `Email saved as file in ${emailPath},
being served from http://localhost:${port}/tmp/dev-email/${emailFileName}`,
      {
        ...email,
        // Already rendered and saved in temporary files
        body: undefined,
      },
    );
  }
}
