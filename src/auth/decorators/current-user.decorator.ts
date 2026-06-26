import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/jwt/jwt.service';

type AuthenticatedRequest = Request & {
  user?: JwtPayload & { iat?: number; exp?: number };
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user;
  },
);
