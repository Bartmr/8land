import { Injectable } from '@nestjs/common';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { LoggingService } from 'src/internals/logging/logging.service';
import { JSONApiBase } from '../json-api-base';

@Injectable()
export class RaribleApi extends JSONApiBase {
  protected getDefaultHeaders: () => { [key: string]: string | undefined } =
    () => ({});
  protected apiUrl: string;

  constructor(protected loggingService: LoggingService) {
    super();

    this.apiUrl =
      EnvironmentVariablesService.variables.RARIBLE_ENVIRONMENT === 'dev'
        ? 'https://api-staging.rarible.org/v0.1'
        : 'https://api.rarible.org/v0.1';
  }
}
