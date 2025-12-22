import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RoleDto {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @MinLength(6)
  password!: string;

  @IsEnum(RoleDto)
  role!: RoleDto;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsOptional()
  @IsString()
  locale?: string;
}
