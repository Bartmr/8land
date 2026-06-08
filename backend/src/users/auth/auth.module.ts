import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthSessionsService } from './sessions/auth-sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { UserAuthSession } from './sessions/auth-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAuthSession, User]),
  ],
  providers: [
    AuthGuard,
    AuthSessionsService,
  ],
  exports: [AuthGuard, AuthSessionsService],
  controllers: [AuthController],
})
export class AuthModule {}
