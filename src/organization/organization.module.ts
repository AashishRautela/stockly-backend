import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { SeederModule } from 'src/seeder/seeder.module';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';

@Module({
  imports: [AuthModule, SeederModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
