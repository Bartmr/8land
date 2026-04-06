import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoorBlock } from './door-block.entity';
import { Land } from 'src/land/land.entity';
import { BlocksController } from './blocks.controller';
import { AppBlock } from './app-block.entity';
import { AuthModule } from 'src/users/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Land, DoorBlock, AppBlock]),
    AuthModule,
  ],
  controllers: [BlocksController],
})
export class BlocksModule {}
