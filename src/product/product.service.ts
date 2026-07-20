import { Injectable } from '@nestjs/common';
import { AppError } from 'src/common/errors/app-error';
import { SuccessResponse } from 'src/common/responses/success-response';
import { JwtPayload } from 'src/jwt/jwt.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertSkuAvailable(
    orgId: string,
    sku: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.product.findFirst({
      where: {
        org_id: orgId,
        sku,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new AppError(
        'Product SKU already exists in this organization',
        409,
      );
    }
  }

  private async assertBarcodeAvailable(
    orgId: string,
    barcode: string | undefined,
    excludeId?: string,
  ) {
    if (!barcode) {
      return;
    }

    const existing = await this.prisma.product.findFirst({
      where: {
        org_id: orgId,
        barcode,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new AppError(
        'Product barcode already exists in this organization',
        409,
      );
    }
  }

  async createProduct(body: CreateProductDto, user: JwtPayload, orgId: string) {
    await this.assertSkuAvailable(orgId, body.sku);
    await this.assertBarcodeAvailable(orgId, body.barcode);

    await this.prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        barcode: body.barcode,
        cost_price: body.cost_price,
        sell_price: body.sell_price,
        reorder_level: body.reorder_level ?? 0,
        org_id: orgId,
        created_by_id: user.sub,
      },
    });

    return SuccessResponse('Product created successfully');
  }

  async listProducts(orgId: string) {
    const products = await this.prisma.product.findMany({
      where: { org_id: orgId, deleted_at: null },
    });

    return SuccessResponse('Products fetched successfully', products);
  }

  async getProductDetail(id: string, orgId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, org_id: orgId, deleted_at: null },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return SuccessResponse('Product details fetched successfully', product);
  }

  async updateProduct(id: string, body: UpdateProductDto, orgId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, org_id: orgId, deleted_at: null },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (body.sku && body.sku !== product.sku) {
      await this.assertSkuAvailable(orgId, body.sku, id);
    }

    if (body.barcode && body.barcode !== product.barcode) {
      await this.assertBarcodeAvailable(orgId, body.barcode, id);
    }

    await this.prisma.product.update({
      where: { id },
      data: { ...body },
    });

    return SuccessResponse('Product updated successfully');
  }

  async deleteProduct(id: string, orgId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, org_id: orgId, deleted_at: null },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await this.prisma.product.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return SuccessResponse('Product deleted successfully');
  }
}
