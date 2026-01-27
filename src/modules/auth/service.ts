/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { loginInputDto } from './dto';
import { compare } from 'bcryptjs';
import { RedisService } from 'src/infra/redis/service';
import { AuthenticatedRequest } from 'src/shared/types/authenticatedRequest';
import { ConfigService } from '@nestjs/config';
import { AuthContract } from './constract';
@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthContract,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    data: loginInputDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const producer = await this.authRepository.findProducer(data.email);

    if (!producer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await compare(data.password, producer.password_hash);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = {
      id: producer.id_producer,
      username: producer.username,
      role: producer.role,
    };

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('REFRESH_SECRET'),
      expiresIn: '7d',
    });

    await this.redisService.set(
      `refresh_${producer.id_producer}`,
      refreshToken,
      604800,
    );

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(producer: AuthenticatedRequest['producer']) {
    await this.redisService.del(`refresh_${producer.id}`);
  }

  async refresh(
    req: AuthenticatedRequest,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException(`Token not found`);
    }

    const refreshTokenPayload = await this.jwtService.verifyAsync(
      refreshToken,
      {
        secret: process.env.REFRESH_SECRET,
      },
    );

    const isInRedis = await this.redisService.get(
      `refresh_${refreshTokenPayload.id}`,
    );

    if (!isInRedis || isInRedis !== refreshToken) {
      throw new UnauthorizedException(`Token not found`);
    }

    const { iat, exp, ...payload } = { ...refreshTokenPayload };

    const accessToken = await this.jwtService.signAsync(payload);

    const newRefreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: '7d',
    });

    await this.redisService.set(
      `refresh_${refreshTokenPayload.id}`,
      newRefreshToken,
      604800,
    );

    return {
      accessToken,
      newRefreshToken,
    };
  }
}
