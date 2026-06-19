import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandModule } from 'src/land/land.module';
import { Land } from 'src/land/land.entities';
import { NavigationState } from 'src/navigation/state/navigation-state.entities';
import { User } from 'src/users/user.entities';
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
