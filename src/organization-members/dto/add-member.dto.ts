import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class AddMemberDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsUUID()
  role_id?: string;

  @IsOptional()
  @IsString()
  first_name?: string;

  @IsOptional()
  @IsString()
  last_name?: string;
}
