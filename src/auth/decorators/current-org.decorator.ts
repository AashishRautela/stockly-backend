import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ORG_ID = 'x-org-id';

export const CurrentOrg = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const header = request.headers[ORG_ID];
    return Array.isArray(header) ? header[0] : header;
  },
);
