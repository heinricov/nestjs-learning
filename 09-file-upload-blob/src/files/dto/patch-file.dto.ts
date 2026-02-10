import { IsOptional, IsString, Matches } from 'class-validator';

export class PatchFileDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]+$/)
  folder?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
