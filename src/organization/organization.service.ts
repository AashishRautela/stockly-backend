import { Injectable } from '@nestjs/common';
import { AuditActorType } from '../../generated/prisma/enums';
import { AppError } from 'src/common/errors/app-error';
import { SuccessResponse } from 'src/common/responses/success-response';
import { JwtPayload } from 'src/jwt/jwt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesSeederService } from 'src/seeder/services/roles-seeder.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { randomBytes } from 'crypto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesSeederService: RolesSeederService,
  ) {}

  private createSlug(name: string): string {
    return name
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(body: CreateOrganizationDto, user: JwtPayload) {
    let slug = this.createSlug(body.name);

    const isSlugExists = await this.prisma.organization.findFirst({
      where: { slug },
    });
    if (isSlugExists) {
      slug = `${slug}-${randomBytes(4).toString('hex')}`;
    }

    const roleTemplates = this.rolesSeederService.getRoleTemplates();

    await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          ...body,
          slug,
          created_by_id: user.sub,
        },
      });

      // Create the default org roles from the seed templates.
      await tx.role.createMany({
        data: roleTemplates.map((role) => ({
          name: role.name,
          description: role.description,
          org_id: organization.id,
          permissions: role.permissions,
          created_by_type:
            role.created_by === 'System'
              ? AuditActorType.SYSTEM
              : AuditActorType.USER,
          created_by: role.created_by === 'System' ? null : user.sub,
          updated_by_type:
            role.created_by === 'System'
              ? AuditActorType.SYSTEM
              : AuditActorType.USER,
          updated_by: role.created_by === 'System' ? null : user.sub,
        })),
      });

      const ownerRole = await tx.role.findFirst({
        where: {
          org_id: organization.id,
          name: 'Owner',
        },
        select: {
          id: true,
        },
      });

      if (!ownerRole) {
        throw new AppError('Owner role could not be created', 500, [
          'Organization bootstrap failed because the Owner role was not found',
        ]);
      }

      // The org creator becomes the first member with the Owner role.
      await tx.organizationMember.create({
        data: {
          user_id: user.sub,
          org_id: organization.id,
          role_id: ownerRole.id,
          joined_at: new Date(),
        },
      });
    });

    return SuccessResponse('Organization created successfully');
  }

  async update(id: string, body: UpdateOrganizationDto, _user: JwtPayload) {
    const existingOrganization = await this.prisma.organization.findUnique({
      where: { id, deleted_at: null },
    });

    if (!existingOrganization) {
      throw new AppError('Organization not found', 404);
    }

    let nextSlug = body.slug;

    if (body.name && !nextSlug) {
      nextSlug = this.createSlug(body.name);
    }

    if (nextSlug) {
      nextSlug = this.createSlug(nextSlug);

      const organizationWithSameSlug = await this.prisma.organization.findFirst(
        {
          where: {
            slug: nextSlug,
            NOT: {
              id,
            },
          },
        },
      );

      if (organizationWithSameSlug) {
        nextSlug = `${nextSlug}-${randomBytes(4).toString('hex')}`;
      }
    }

    await this.prisma.organization.update({
      where: { id },
      data: {
        ...body,
        ...(nextSlug ? { slug: nextSlug } : {}),
      },
    });

    return SuccessResponse('Organization updated successfully');
  }

  async get(id: string, user: JwtPayload) {
    const organization = await this.prisma.organization.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        name: true,
        slug: true,
        email: true,
        business_name: true,
        phone_number: true,
        website: true,
        logo: true,
        industry: true,
        country: true,
        timezone: true,
        currency: true,
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    return SuccessResponse(
      'Organiation details get successfully',
      organization,
    );
  }

  async delete(id: string, user: JwtPayload) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    await this.prisma.organization.update({
      where: { id },
      data: {
        deleted_at: new Date(),
      },
    });

    return SuccessResponse('Organization deleted successfully');
  }

  async getOrgList(user: JwtPayload) {
    const userId = user.sub;

    const organizations = await this.prisma.organization.findMany({
      where: {
        organization_members: {
          some: {
            user_id: userId,
          },
        },
      },
    });

    return SuccessResponse(
      'Organization list fehced successfully',
      organizations,
    );
  }
}
