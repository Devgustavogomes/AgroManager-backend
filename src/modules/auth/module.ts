import { Module } from '@nestjs/common';
import { AuthController } from './controller';
import { AuthService } from './service';
import { AuthRepository } from './repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthContract } from './constract';
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, { provide: AuthContract, useClass: AuthRepository }],
})
export class AuthModule {}
