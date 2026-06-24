import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppError } from 'src/common/errors/app-error';
import { SuccessResponse } from 'src/common/responses/success-response';
import { JwtService } from 'src/jwt/jwt.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(body: CreateUserDto) {
    const email = body.email.trim().toLowerCase();

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User already exists', 409, [
        'A user with this email already exists',
      ]);
    }

    const hashedPassword = await hash(body.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        first_name: body.first_name,
        last_name: body.last_name,
        phone_number: body.phone_number,
        password: hashedPassword,
      },
    });

    const { password, ...safeUser } = user;
    return SuccessResponse('User signup successful', safeUser);
  }

  async signin(body: UserLoginDto) {
    const email = body.email.trim().toLowerCase();
    const { password } = body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true,
        status: true,
        created_at: true,
        updated_at: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      throw new AppError('Email or password is incorrect', 401);
    }

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new AppError('Email or password is incorrect', 401);
    }

    const accessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email,
    });
    const refreshToken = this.jwtService.generateRefreshToken({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      refreshToken,
      response: SuccessResponse('User signin successful'),
    };
  }
}
