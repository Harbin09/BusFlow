import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../domain/enums/user-role.enum';

export class OAuthLoginDto {
  @IsString({ message: 'ID token must be a string' })
  @IsNotEmpty({ message: 'ID token is required' })
  idToken: string;

  @IsEnum(UserRole, { message: `Role must be one of: ${Object.values(UserRole).join(', ')}` })
  @IsNotEmpty({ message: 'Role is required' })
  role: UserRole;

  @IsString({ message: 'Access token must be a string' })
  @IsOptional()
  accessToken?: string;
}
