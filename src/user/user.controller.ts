import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { UserLoginDto } from './dto/user-login.dto';

@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  signup(@Body() body: CreateUserDto) {
    return this.userService.signup(body);
  }

  @Post('signin')
    async signin(
      @Body() body: UserLoginDto,
      @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.userService.signin(body);
        const isProduction = process.env.NODE_ENV === 'production';

        response.cookie('accessToken', result.accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: isProduction,
          maxAge: 15 * 60 * 1000,
        });

        response.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: isProduction,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return result.response;
  }
}
