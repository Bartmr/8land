import { Injectable } from '@nestjs/common';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { LoggingService } from 'src/internals/logging/logging.service';
import { JSONApiBase } from '../json-api-base';

@Injectable()
export class ItselfStorageApi extends JSONApiBase {
  protected apiUrl: string;
  protected getDefaultHeaders: () => { [key: string]: string | undefined };
  protected loggingService: LoggingService;

  constructor(loggingService: LoggingService) {
    super();
    this.apiUrl = `http://localhost:${EnvironmentVariablesService.variables.API_PORT}/tmp/storage`;
    this.getDefaultHeaders = () => ({});
    this.loggingService = loggingService;
  }
}
