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
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseService } from './warehouse.service';

const MODULE = 'warehouse';

@Controller({
  path: 'warehouses',
  version: '1',
})
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // --------------------------------------------------- create warehouse -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'create')
  @Post('/')
  createWarehouse(
    @Body() body: CreateWarehouseDto,
    @CurrentUser() user: JwtPayload,
    @CurrentOrg() orgId: string,
  ) {
    return this.warehouseService.createWarehouse(body, user, orgId);
  }

  // --------------------------------------------------- get warehouses list -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'read')
  @Get('/')
  listWarehouses(@CurrentOrg() orgId: string) {
    return this.warehouseService.listWarehouses(orgId);
  }

  // --------------------------------------------------- get warehouse detail -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'read')
  @Get(':id')
  getWarehouseDetail(@Param('id') id: string, @CurrentOrg() orgId: string) {
    return this.warehouseService.getWarehouseDetail(id, orgId);
  }

  // --------------------------------------------------- update warehouse -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'update')
  @Patch(':id')
  updateWarehouse(
    @Param('id') id: string,
    @Body() body: UpdateWarehouseDto,
    @CurrentOrg() orgId: string,
  ) {
    return this.warehouseService.updateWarehouse(id, body, orgId);
  }

  // --------------------------------------------------- delete warehouse -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'delete')
  @Delete(':id')
  deleteWarehouse(@Param('id') id: string, @CurrentOrg() orgId: string) {
    return this.warehouseService.deleteWarehouse(id, orgId);
  }
}
