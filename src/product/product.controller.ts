import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentOrg } from 'src/auth/decorators/current-org.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { JwtPayload } from 'src/jwt/jwt.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

const MODULE = 'product';

@Controller({
  path: 'products',
  version: '1',
})
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // --------------------------------------------------- create product -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'create')
  @Post('/')
  createProduct(
    @Body() body: CreateProductDto,
    @CurrentUser() user: JwtPayload,
    @CurrentOrg() orgId: string,
  ) {
    return this.productService.createProduct(body, user, orgId);
  }

  // --------------------------------------------------- get products list -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'read')
  @Get('/')
  listProducts(@CurrentOrg() orgId: string) {
    return this.productService.listProducts(orgId);
  }

  // --------------------------------------------------- get product detail -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'read')
  @Get(':id')
  getProductDetail(@Param('id') id: string, @CurrentOrg() orgId: string) {
    return this.productService.getProductDetail(id, orgId);
  }

  // --------------------------------------------------- update product -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'update')
  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
    @CurrentOrg() orgId: string,
  ) {
    return this.productService.updateProduct(id, body, orgId);
  }

  // --------------------------------------------------- delete product -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'delete')
  @Delete(':id')
  deleteProduct(@Param('id') id: string, @CurrentOrg() orgId: string) {
    return this.productService.deleteProduct(id, orgId);
  }
}
