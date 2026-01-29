import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

/**
 * DTO untuk memvalidasi input saat membuat User baru.
 */
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  username: string;
}
