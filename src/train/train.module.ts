import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavigationState } from 'src/users/typeorm/navigation-state.entity';
import { User } from 'src/users/typeorm/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NavigationState, User])],
})
export class TrainModule {}
