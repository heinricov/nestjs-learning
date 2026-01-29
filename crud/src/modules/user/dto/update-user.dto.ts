import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO untuk memvalidasi input saat update User.
 * Semua field dari CreateUserDto menjadi optional.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
