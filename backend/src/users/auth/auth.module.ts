import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthTokensService } from './tokens/auth-tokens.service';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { AuthToken } from './tokens/auth-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthToken, User]),
    FirebaseModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthTokensService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
