import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PermissionGuard } from 'src/auth/guards/permission.guard';
import { JwtPayload } from 'src/jwt/jwt.service';
import { AddMemberDto } from './dto/add-member.dto';
import { ResendMemberAccessDto } from './dto/resend-member-access.dto';
import { MemberService } from './member.service';

const MODULE = 'users';

@Controller({
  path: 'members',
  version: '1',
})

export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // --------------------------------------------------- add members -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'create')
  @Post('/')
  addMember(@Body() body: AddMemberDto, @CurrentUser() user: JwtPayload) {
    return this.memberService.addMember(body, user);
  }

  // --------------------------------------------------- resend member access -------------------------------------------------
  @UseGuards(AuthGuard, PermissionGuard)
  @Permissions(MODULE, 'invite')
  @Post('/resend')
  resendMemberAccess(
    @Body() body: ResendMemberAccessDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.resendMemberAccess(body, user);
  }
}
