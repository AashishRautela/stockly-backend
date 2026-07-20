import { IsEmail } from 'class-validator';

export class ResendMemberAccessDto {
  @IsEmail()
  email!: string;
}
