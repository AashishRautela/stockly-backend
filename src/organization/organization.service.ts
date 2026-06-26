import { Injectable } from '@nestjs/common';
import { AuditActorType } from '../../generated/prisma/enums';
import { SuccessResponse } from 'src/common/responses/success-response';
import { JwtPayload } from 'src/jwt/jwt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesSeederService } from 'src/seeder/services/roles-seeder.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { randomBytes } from 'crypto';

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

      await tx.organizationMember.create({
        data: {
          user_id: user.sub,
          org_id: organization.id,
          joined_at: new Date(),
        },
      });

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
    });

    return SuccessResponse('Organization created successfully');
  }
}
