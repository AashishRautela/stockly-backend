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
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtPayload } from 'src/jwt/jwt.service';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PermissionGuard } from 'src/auth/guards/permission.guard';

const MODULE = 'organization';

@Controller({
  path: 'organizations',
  version: '1',
})
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}


  // --------------------------------------------------- create organization -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'create')
  @Post('/')
    create(
      @Body() body: CreateOrganizationDto,
      @CurrentUser() user: JwtPayload,
    ) {
      return this.organizationService.create(body, user);
    }

  // --------------------------------------------------- update organization -------------------------------------------------

  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'update')
  @Patch(':id')
    update(
      @Param('id') id: string,
      @Body() body: UpdateOrganizationDto,
      @CurrentUser() user: JwtPayload,
    ) {
      return this.organizationService.update(id, body, user);
    }


  // --------------------------------------------------- get organization detail -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'read')
  @Get(":id")
    get(
      @Param('id') id: string,
      @CurrentUser() user: JwtPayload,
    ){
    return this.organizationService.get(id,user);
    }


  // --------------------------------------------------- delete organization -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'delete')
  @Delete(':id')
    delete(
      @Param('id') id: string,
      @CurrentUser() user: JwtPayload,
    ){
    return this.organizationService.delete(id,user);
    }

}
