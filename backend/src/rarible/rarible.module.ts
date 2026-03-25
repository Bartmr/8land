import { Module } from '@nestjs/common';
import { RaribleApi } from './rarible.api';

@Module({
  providers: [RaribleApi],
  exports: [RaribleApi],
})
export class RaribleModule {}
