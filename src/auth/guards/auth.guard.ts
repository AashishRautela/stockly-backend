import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AppError } from 'src/common/errors/app-error';
import { JwtService, JwtPayload } from 'src/jwt/jwt.service';

type AuthenticatedRequest = Request & {
  user?: JwtPayload & { iat?: number; exp?: number };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractAccessTokenFromCookie(request);

    if (!token) {
      throw new AppError('User is not authenticated', 401, [
        'Access token cookie is missing',
      ]);
    }

    const decoded = this.jwtService.verifyAccessToken(token);
    request.user = {
      sub: decoded.sub,
      email: decoded.email,
      iat: decoded.iat,
      exp: decoded.exp,
    };

    return true;
  }

  private extractAccessTokenFromCookie(request: Request) {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return null;
    }

    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const accessTokenCookie = cookies.find((cookie) =>
      cookie.startsWith('accessToken='),
    );

    if (!accessTokenCookie) {
      return null;
    }

    return decodeURIComponent(accessTokenCookie.split('=').slice(1).join('='));
  }
}
