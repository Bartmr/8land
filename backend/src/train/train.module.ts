import { Module } from '@nestjs/common';
import { TypeormFeatureModule } from 'src/databases/typeorm.module';
import { LandModule } from 'src/land/land.module';
import { Land } from 'src/land/land.entity';
import { NavigationState } from 'src/users/navigation-state.entity';
import { User } from 'src/users/user.entity';
import { TrainController } from './train.controller';
import { AuthModule } from 'src/users/auth/auth.module';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [Land, NavigationState, User],
    }),
    LandModule,
    AuthModule,
  ],
  controllers: [TrainController],
})
export class TrainModule {}
