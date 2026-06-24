import { Body, Controller, Post } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller({
  path: 'organizations',
  version: '1',
})
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('/')
  create(@Body() body: CreateOrganizationDto) {
    return this.organizationService.create(body);
  }
}
