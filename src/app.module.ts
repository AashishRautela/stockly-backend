import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AppService } from './app.service';
import { OrganizationModule } from './organization/organization.module';
import { UserModule } from './user/user.module';
import { MemberModule } from './organization-members/member.module';

@Module({
  imports: [PrismaModule, UserModule, OrganizationModule,MemberModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
