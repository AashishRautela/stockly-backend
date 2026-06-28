import { Module } from '@nestjs/common';
import { JwtModule } from 'src/jwt/jwt.module';
import { MailModule } from 'src/mail/mail.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [JwtModule, MailModule],
  controllers: [MemberController],
  providers: [MemberService],
})
export class MemberModule {}
