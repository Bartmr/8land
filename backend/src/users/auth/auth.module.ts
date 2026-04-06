import { Module } from '@nestjs/common';
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
    AuthGuard,
    AuthTokensService,
  ],
  exports: [AuthGuard, AuthTokensService],
  controllers: [AuthController],
})
export class AuthModule {}
