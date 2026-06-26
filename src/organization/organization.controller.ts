import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { JwtPayload } from 'src/jwt/jwt.service';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller({
  path: 'organizations',
  version: '1',
})
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(AuthGuard)
  @Post('/')
  create(
    @Body() body: CreateOrganizationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.organizationService.create(body, user);
  }
}
