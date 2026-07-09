import util from 'util';
import fs from 'fs';
import path from 'path';
import { LOCAL_TEMPORARY_FILES_PATH } from 'src/core/temporary-files';
import { Email, EmailService } from './email.service';
import { HttpAdapterHost } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { throwError } from 'src/core/throw-error';
import { v4 } from 'uuid';

const writeFile = util.promisify(fs.writeFile);
const mkDir = util.promisify(fs.mkdir);

@Injectable()
export class DevEmailService extends EmailService {
  private logger: Logger = new Logger(DevEmailService.name)
  
  constructor(
    private httpAdapterHost: HttpAdapterHost,
  ) {
    super();
  }

  async sendEmail(email: Email): Promise<void> {
    const emailsDirectoryPath = path.join(
      LOCAL_TEMPORARY_FILES_PATH,
      'dev-email',
    );

    await mkDir(emailsDirectoryPath, { recursive: true });

    const emailFileName = `${v4()}.html`;
    const emailPath = path.join(emailsDirectoryPath, emailFileName);

    await writeFile(emailPath, this.renderEmail(email), { encoding: 'utf8' });

    const address = this.httpAdapterHost.httpAdapter.getHttpServer().address();

    const port =
      address === null || typeof address === 'string'
        ? throwError()
        : address.port;

    this.logger.log(
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
