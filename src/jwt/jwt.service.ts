import { Injectable } from '@nestjs/common';
import { JwtPayload as BaseJwtPayload, sign, verify } from 'jsonwebtoken';
import { AppError } from 'src/common/errors/app-error';

export type JwtPayload = {
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
      expiresIn: '1h',
    });
  }

  generateRefreshToken(payload: JwtPayload) {
    return sign(payload, this.getRefreshSecret(), {
      expiresIn: '7d',
    });
  }

  verifyAccessToken(token: string) {
    try {
      return verify(token, this.getAccessSecret()) as BaseJwtPayload & JwtPayload;
    } catch {
      throw new AppError('Invalid access token', 401);
    }
  }

  verifyRefreshToken(token: string) {
    try {
      return verify(token, this.getRefreshSecret()) as BaseJwtPayload & JwtPayload;
    } catch {
      throw new AppError('Invalid refresh token', 401);
    }
  }
}
