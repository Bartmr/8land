import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandModule } from 'src/land/land.module';
import { Land } from 'src/land/land.entity';
import { NavigationState } from 'src/navigation/state/navigation-state.entity';
import { User } from 'src/users/user.entity';
import { TrainController } from './train.controller';
import { AuthModule } from 'src/users/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Land, NavigationState, User]),
    LandModule,
    AuthModule,
  ],
  controllers: [TrainController],
})
export class TrainModule {}
