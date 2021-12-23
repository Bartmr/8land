import { Module } from '@nestjs/common';
import { LandController } from './land.controller';

@Module({
  controllers: [LandController],
})
export class LandModule {}
