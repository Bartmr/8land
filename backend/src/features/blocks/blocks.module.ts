import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoorBlock } from './door-block.entities';
import { Land } from 'src/features/land/land.entities';
import { BlocksController } from './blocks.controller';
import { AppBlock } from './app-block.entities';
import { AuthModule } from 'src/features/users/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Land, DoorBlock, AppBlock]),
    AuthModule,
  ],
  controllers: [BlocksController],
})
export class BlocksModule {}
