import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppError } from 'src/common/errors/app-error';
import { SuccessResponse } from 'src/common/responses/success-response';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
    return SuccessResponse('User signup successful');
  }
}
