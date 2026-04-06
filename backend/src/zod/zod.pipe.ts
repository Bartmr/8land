import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodObject } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject) {}

  transform(value: unknown) {
      const result = this.schema.safeParse(value);
      if (!result.success) {
        throw new BadRequestException();
      } else {
        return result.data
      }
  }
}
