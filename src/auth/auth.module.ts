import { Module } from '@nestjs/common';
import { JwtModule } from 'src/jwt/jwt.module';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [JwtModule],
  providers: [AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
