import { Module } from '@nestjs/common';
import { CROSS_CUTTING_PROVIDERS } from './cross-cutting-providers';
import { LoggingModule } from './internals/logging/logging.module';
import { LoggingServiceSingleton } from './internals/logging/logging.service.singleton';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DEFAULT_DB_TYPEORM_CONN_OPTS } from './internals/databases/default-db-typeorm-conn-opts';
import { AuthModule } from './auth/auth.module';
import { LandModule } from './land/land.module';
import { BlocksModule } from './blocks/blocks.module';

@Module({
  imports: [
    LoggingModule.forRoot(() => LoggingServiceSingleton.getInstance()),
    TypeOrmModule.forRoot({
      ...DEFAULT_DB_TYPEORM_CONN_OPTS,
      autoLoadEntities: true,
    }),
    AuthModule,
    LandModule,
    BlocksModule,
  ],
  providers: [...CROSS_CUTTING_PROVIDERS],
})
export class AppModule {}
