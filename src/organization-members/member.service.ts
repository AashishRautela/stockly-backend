import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { generatePassword } from 'password-generator';
import { AppError } from 'src/common/errors/app-error';
import { SuccessResponse } from 'src/common/responses/success-response';
import { JwtPayload } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';
import { ResendMemberAccessDto } from './dto/resend-member-access.dto';

const DEFAULT_MAIL_FROM = 'Stockly <onboarding@resend.dev>';
const DEFAULT_ROLE_NAME = 'Employee';

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  private async generateTemporaryPassword(): Promise<string> {
    return generatePassword(12, false, /[A-Z0-9a-z]/);
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private getTestRecipientEmail(recipientEmail: string) {
    return process.env.RESEND_TEST_TO_EMAIL?.trim().toLowerCase() || recipientEmail;
  }

  private async getOrganization(orgId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        id: orgId,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    return organization;
  }

  private async getRole(orgId: string, roleId?: string) {
    if (roleId) {
      const role = await this.prisma.role.findFirst({
        where: {
          id: roleId,
          org_id: orgId,
          deleted_at: null,
        },
        select: {
          id: true,
          name: true,
        },
      });

      if (!role) {
        throw new AppError('Role not found', 404);
      }

      return role;
    }

    const defaultRole = await this.prisma.role.findFirst({
      where: {
        org_id: orgId,
        name: DEFAULT_ROLE_NAME,
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!defaultRole) {
      throw new AppError('Default member role is missing', 500, [
        `${DEFAULT_ROLE_NAME} role was not found for this organization`,
      ]);
    }

    return defaultRole;
  }

  private buildMemberAccessEmail(params: {
    recipientEmail: string;
    organizationName: string;
    temporaryPassword: string;
    roleName: string;
  }) {
    const { recipientEmail, organizationName, temporaryPassword, roleName } =
      params;

    return `
      <div style="margin:0;padding:32px 16px;background:#f4f7fb;font-family:Arial,sans-serif;color:#172033;">
        <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dde5f0;">
          <div style="padding:32px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:#ffffff;">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;opacity:0.8;">Stockly</p>
            <h1 style="margin:0;font-size:28px;line-height:1.2;">Your workspace access is ready</h1>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
              You have been added to <strong>${organizationName}</strong> as <strong>${roleName}</strong>.
            </p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
              Use the credentials below to sign in and change your password after login.
            </p>
            <div style="padding:20px;border-radius:16px;background:#f8fafc;border:1px solid #dbe4f0;">
              <p style="margin:0 0 10px;font-size:14px;color:#475569;">Email</p>
              <p style="margin:0 0 18px;font-size:16px;font-weight:700;color:#0f172a;">${recipientEmail}</p>
              <p style="margin:0 0 10px;font-size:14px;color:#475569;">Temporary password</p>
              <p style="margin:0;font-size:20px;font-weight:700;letter-spacing:1px;color:#1d4ed8;">${temporaryPassword}</p>
            </div>
            <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
              If you did not expect this email, please contact your organization administrator.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  async addMember(body: AddMemberDto, _user: JwtPayload) {
    const email = this.normalizeEmail(body.email);

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const organization = await this.getOrganization(body.org_id);
    const role = await this.getRole(body.org_id, body.role_id);
    const temporaryPassword = await this.generateTemporaryPassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email },
        select: {
          id: true,
        },
      });

      const userRecord =
        existingUser ??
        (await tx.user.create({
          data: {
            email,
            first_name: body.first_name?.trim() || null,
            last_name: body.last_name?.trim() || null,
            password: hashedPassword,
          },
          select: {
            id: true,
          },
        }));

      const existingMembership = await tx.organizationMember.findFirst({
        where: {
          org_id: body.org_id,
          user_id: userRecord.id,
          deleted_at: null,
        },
        select: {
          id: true,
        },
      });

      if (existingMembership) {
        throw new AppError('Member already exists in this organization', 409);
      }

      await tx.organizationMember.create({
        data: {
          org_id: body.org_id,
          user_id: userRecord.id,
          role_id: role.id,
          joined_at: new Date(),
        },
      });
    });

    const recipientEmail = this.getTestRecipientEmail(email);

    await this.mail.sendMail({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_MAIL_FROM,
      to: recipientEmail,
      subject: `You have been added to ${organization.name}`,
      html: this.buildMemberAccessEmail({
        recipientEmail,
        organizationName: organization.name,
        temporaryPassword,
        roleName: role.name,
      }),
    });

    return SuccessResponse('Member added successfully');
  }

  async resendMemberAccess(body: ResendMemberAccessDto, _user: JwtPayload) {
    const email = this.normalizeEmail(body.email);

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const organization = await this.getOrganization(body.org_id);

    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        org_id: body.org_id,
        deleted_at: null,
        user: {
          email,
          deleted_at: null,
        },
      },
      select: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!membership) {
      throw new AppError('Member not found in this organization', 404);
    }

    const temporaryPassword = await this.generateTemporaryPassword();
    const hashedPassword = await hash(temporaryPassword, 10);

    await this.prisma.user.update({
      where: {
        id: membership.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    const recipientEmail = this.getTestRecipientEmail(membership.user.email);

    await this.mail.sendMail({
      from: process.env.RESEND_FROM_EMAIL || DEFAULT_MAIL_FROM,
      to: recipientEmail,
      subject: `Your ${organization.name} access has been resent`,
      html: this.buildMemberAccessEmail({
        recipientEmail,
        organizationName: organization.name,
        temporaryPassword,
        roleName: membership.role.name,
      }),
    });

    return SuccessResponse('Member access resent successfully');
  }
}
