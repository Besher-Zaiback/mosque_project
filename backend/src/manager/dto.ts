import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { UserRole } from '../common/enums';

export class CreateStudentDto {
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsInt()
  circleId!: number;

  @IsNotEmpty()
  password!: string;
}

export class CreateSupervisorDto {
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsInt()
  mosqueId?: number;
}

export class CircleDto {
  @IsNotEmpty()
  name!: string;

  @IsInt()
  levelOrder!: number;

  @IsInt()
  startPage!: number;

  @IsInt()
  endPage!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999999)
  supervisorId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  mosqueId?: number;
}

export class UpdateCircleDto {
  @IsNotEmpty()
  name!: string;

  @IsInt()
  levelOrder!: number;

  @IsInt()
  startPage!: number;

  @IsInt()
  endPage!: number;

  @IsInt()
  @Min(0)
  supervisorId!: number;
}

export class CreateAccountDto {
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsInt()
  mosqueId?: number;

  @IsOptional()
  @IsInt()
  circleId?: number;

  @IsOptional()
  @IsInt()
  linkedStudentId?: number;
}

export class UpdateAccountDto {
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsNotEmpty()
  password?: string;

  @IsOptional()
  @IsInt()
  mosqueId?: number;

  @IsOptional()
  @IsInt()
  circleId?: number;

  @IsOptional()
  @IsInt()
  linkedStudentId?: number;
}
