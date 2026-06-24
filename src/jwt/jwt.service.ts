import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { AppError } from 'src/common/errors/app-error';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtService {
  private getAccessSecret() {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new AppError('JWT access secret is missing', 500);
    }

    return secret;
  }

  private getRefreshSecret() {
    const secret = process.env.JWT_REFRESH_SECRET;

    if (!secret) {
      throw new AppError('JWT refresh secret is missing', 500);
    }

    return secret;
  }

  generateAccessToken(payload: JwtPayload) {
    return sign(payload, this.getAccessSecret(), {
      expiresIn: '15m',
    });
  }

  generateRefreshToken(payload: JwtPayload) {
    return sign(payload, this.getRefreshSecret(), {
      expiresIn: '7d',
    });
  }
}
