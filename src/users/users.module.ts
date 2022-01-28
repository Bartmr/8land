import { Module } from '@nestjs/common';
import { TypeOrmModule } from 'nestjs-typeorm-bartmr';
import { User } from './typeorm/user.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
})
export class UsersModule {}
