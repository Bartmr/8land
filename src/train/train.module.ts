import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Land } from 'src/land/typeorm/land.entity';
import { NavigationState } from 'src/users/typeorm/navigation-state.entity';
import { User } from 'src/users/typeorm/user.entity';
import { TrainController } from './train.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Land, NavigationState, User])],
  controllers: [TrainController],
})
export class TrainModule {}
