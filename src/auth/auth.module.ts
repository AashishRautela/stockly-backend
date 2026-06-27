import { Module } from '@nestjs/common';
import { JwtModule } from 'src/jwt/jwt.module';
import { AuthGuard } from './guards/auth.guard';
import { PermissionGuard } from './guards/permission.guard';

@Module({
  imports: [JwtModule],
  providers: [AuthGuard, PermissionGuard],
  exports: [AuthGuard, PermissionGuard, JwtModule],
})
export class AuthModule {}
