import { Module } from '@nestjs/common';
import { ProducerModule } from './modules/producer/module';
import { DatabaseModule } from './infra/database/module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { envSchema } from './config/dto/env.dto';
import { AuthModule } from './modules/auth/module';
import { RedisModule } from './infra/redis/module';
import { MigrationModule } from './infra/migration/module';
import { PropertyModule } from './modules/property/module';
import { CultureModule } from './modules/culture/module';
import { CropModule } from './modules/crops/module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      load: [configuration],
      validate: (env) => envSchema.parse(env),
    }),
    ProducerModule,
    DatabaseModule,
    AuthModule,
    RedisModule,
    MigrationModule,
    PropertyModule,
    CultureModule,
    CropModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
