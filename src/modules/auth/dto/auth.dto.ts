import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

import { IsEnum, IsOptional } from 'class-validator';
import { ValidationMessage } from 'src/common/filters/validation.messages';

export class LoginDto {
  @IsString({
    message: ValidationMessage('email').isString,
  })
  @IsNotEmpty({
    message: ValidationMessage('email').isNotEmpty,
  })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString({
    message: ValidationMessage('password').isString,
  })
  @IsNotEmpty({
    message: ValidationMessage('password').isNotEmpty,
  })
  @ApiProperty()
  password: string;
}

export class RegistrationDto {
  @IsString({
    message: ValidationMessage('email').isString,
  })
  @IsNotEmpty({
    message: ValidationMessage('email').isNotEmpty,
  })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString({
    message: ValidationMessage('Name').isString,
  })
  @IsNotEmpty({
    message: ValidationMessage('Name').isNotEmpty,
  })
  @ApiProperty()
  name: string;

  @IsString({
    message: ValidationMessage('Password').isString,
  })
  @IsNotEmpty({
    message: ValidationMessage('Password').isNotEmpty,
  })
  @MinLength(6)
  @ApiProperty()
  password: string;

  @IsString({
    message: ValidationMessage('Confirm Password').isString,
  })
  @IsNotEmpty({
    message: ValidationMessage('Confirm Password').isNotEmpty,
  })
  @MinLength(6)
  @ApiProperty()
  confirmPassword: string;
}

export class EmailVerificationDto {
  @IsString({
    message: ValidationMessage('email').isString,
  })
  @IsNotEmpty({
    message: ValidationMessage('email').isNotEmpty,
  })
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString({
    message: ValidationMessage('code').isString,
  })
  @IsNotEmpty({
    message: ValidationMessage('code').isNotEmpty,
  })
  @ApiProperty()
  code: string;
}

export class UpdatePasswordDto {
  @IsOptional()
  @IsString()
  @ApiProperty()
  hash: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  userId: string;

  @IsString()
  @MinLength(6)
  @ApiProperty()
  newPassword: string;

  @IsString()
  @MinLength(6)
  @ApiProperty()
  confirmPassword: string;
}

export class ForgetPasswordDto {
  @IsString()
  @Length(6)
  @ApiProperty()
  code: string;

  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class VerificationCodeSenderDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;
}
