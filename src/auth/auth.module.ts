import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AUTH_MODULE_ENTITIES } from './auth-module-entities';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthTokensService } from './tokens/auth-tokens.service';
import { FirebaseModule } from 'src/internals/apis/firebase/firebase.module';
import { TypeormFeatureModule } from 'src/internals/databases/typeorm.module';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: AUTH_MODULE_ENTITIES,
    }),
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
