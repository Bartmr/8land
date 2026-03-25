import { Module } from '@nestjs/common';
import { TypeormFeatureModule } from 'src/internals/databases/typeorm.module';
import { User } from './typeorm/user.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: [User],
    }),
  ],
  controllers: [UsersController],
})
export class UsersModule {}
