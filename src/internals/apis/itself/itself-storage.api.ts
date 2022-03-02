import { Injectable } from '@nestjs/common';
import { LoggingService } from 'src/internals/logging/logging.service';
import { JSONApiBase } from '../json-api-base';

@Injectable()
export class ItselfStorageApi extends JSONApiBase {
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
