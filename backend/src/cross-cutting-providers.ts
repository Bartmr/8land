import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './error-handling/all-exceptions.filter';
import { AppValidationPipe } from './validation/validation.pipe';

export const CROSS_CUTTING_PROVIDERS = [
  {
    provide: APP_PIPE,
    useClass: AppValidationPipe,
  },
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
];
