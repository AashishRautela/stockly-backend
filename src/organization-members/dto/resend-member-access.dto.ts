import { IsEmail, IsUUID } from 'class-validator';

export class ResendMemberAccessDto {
  @IsEmail()
  email!: string;

  @IsUUID()
  org_id!: string;
}
