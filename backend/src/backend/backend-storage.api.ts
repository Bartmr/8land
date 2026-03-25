import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/logging/logging.service';
import { JSONApiBase } from '../apis/json-api-base';

@Injectable()
export class BackendStorageApi extends JSONApiBase {
  protected apiUrl: string;
  protected getDefaultHeaders: () => { [key: string]: string | undefined };
  protected loggingService: LoggingService;

  constructor(loggingService: LoggingService, apiUrl: string) {
    super();
    this.apiUrl = apiUrl;
    this.getDefaultHeaders = () => ({});
    this.loggingService = loggingService;
  }
}
