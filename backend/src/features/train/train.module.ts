import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandModule } from 'src/features/land/land.module';
import { Land } from 'src/features/land/land.entities';
import { NavigationState } from 'src/features/navigation/state/navigation-state.entities';
import { User } from 'src/features/users/user.entities';
import { TrainController } from './train.controller';
import { AuthModule } from 'src/features/users/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Land, NavigationState, User]),
    LandModule,
    AuthModule,
  ],
  controllers: [TrainController],
})
export class TrainModule {}
