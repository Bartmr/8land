import { Module } from '@nestjs/common';
import { TypeormFeatureModule } from 'src/databases/typeorm.module';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [User],
    }),
    AuthModule,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
