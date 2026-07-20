import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  PERMISSIONS_KEY,
  PermissionMetadata,
} from 'src/auth/decorators/permissions.decorator';
import { AppError } from 'src/common/errors/app-error';
import { ORG_ID } from 'src/auth/decorators/current-org.decorator';
import { JwtPayload } from 'src/jwt/jwt.service';
import { PrismaService } from 'src/prisma/prisma.service';

type AuthenticatedRequest = Request & {
  user?: JwtPayload & { iat?: number; exp?: number };
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const permission = this.reflector.get<PermissionMetadata>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!user) {
      throw new AppError('User is not authenticated', 401);
    }

    if (!permission) {
      return true;
    }

    if (
      permission.module === 'organization' &&
      permission.action === 'create'
    ) {
      return true;
    }

    const hasPermission = await this.hasUserPermission(request, permission);

    if (!hasPermission) {
      throw new AppError('You are not allowed to perform this action', 403);
    }

    return true;
  }

  private async hasUserPermission(
    request: AuthenticatedRequest,
    permission: PermissionMetadata,
  ) {
    const user = request.user;

    if (!user) {
      return false;
    }

    const orgHeader = request.headers[ORG_ID];

    const organizationId =
      (Array.isArray(orgHeader) ? orgHeader[0] : orgHeader) ||
      request.params?.id ||
      request.body?.org_id ||
      request.body?.organization_id;

    if (!organizationId) {
      return false;
    }

    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        user_id: user.sub,
        org_id: organizationId,
      },
      select: {
        role: {
          select: {
            permissions: true,
          },
        },
      },
    });

    if (!membership?.role?.permissions) {
      return false;
    }

    const permissions = membership.role.permissions as Record<string, string[]>;
    const allowedActions = permissions[permission.module] ?? [];

    return allowedActions.includes(permission.action);
  }
}
