import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * LoginDto for POST /auth/login
 * Contains student/driver email and password
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
