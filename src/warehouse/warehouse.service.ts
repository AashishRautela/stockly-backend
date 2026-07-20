import { Injectable } from '@nestjs/common';
import { AppError } from 'src/common/errors/app-error';
import { SuccessResponse } from 'src/common/responses/success-response';
import { JwtPayload } from 'src/jwt/jwt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertCodeAvailable(
    orgId: string,
    code: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.warehouse.findFirst({
      where: {
        org_id: orgId,
        code,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new AppError(
        'Warehouse code already exists in this organization',
        409,
      );
    }
  }

  async createWarehouse(
    body: CreateWarehouseDto,
    user: JwtPayload,
    orgId: string,
  ) {
    await this.assertCodeAvailable(orgId, body.code);

    await this.prisma.warehouse.create({
      data: {
        name: body.name,
        code: body.code,
        location: body.location,
        org_id: orgId,
        created_by_id: user.sub,
      },
    });

    return SuccessResponse('Warehouse created successfully');
  }

  async listWarehouses(orgId: string) {
    const warehouses = await this.prisma.warehouse.findMany({
      where: { org_id: orgId, deleted_at: null },
    });

    return SuccessResponse('Warehouses fetched successfully', warehouses);
  }

  async getWarehouseDetail(id: string, orgId: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, org_id: orgId, deleted_at: null },
    });

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    return SuccessResponse('Warehouse details fetched successfully', warehouse);
  }

  async updateWarehouse(id: string, body: UpdateWarehouseDto, orgId: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, org_id: orgId, deleted_at: null },
    });

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    if (body.code && body.code !== warehouse.code) {
      await this.assertCodeAvailable(orgId, body.code, id);
    }

    await this.prisma.warehouse.update({
      where: { id },
      data: { ...body },
    });

    return SuccessResponse('Warehouse updated successfully');
  }

  async deleteWarehouse(id: string, orgId: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, org_id: orgId, deleted_at: null },
    });

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    await this.prisma.warehouse.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return SuccessResponse('Warehouse deleted successfully');
  }
}
