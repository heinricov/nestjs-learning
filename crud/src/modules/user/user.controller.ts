import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

/**
 * Controller RESTful untuk resource Users.
 */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
    data: User;
  }> {
    return this.userService.create(createUserDto).then((user) => ({
      success: true,
      message: 'User berhasil dibuat',
      statusCode: HttpStatus.CREATED,
      data: user,
    }));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
    count: number;
    data: User[];
  }> {
    return this.userService.findAll().then((users) => ({
      success: true,
      message: 'Daftar user berhasil diambil',
      statusCode: HttpStatus.OK,
      count: users.length,
      data: users,
    }));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
    count: number;
    data: User;
  }> {
    return this.userService.findOne(id).then((user) => ({
      success: true,
      message: 'Detail user berhasil diambil',
      statusCode: HttpStatus.OK,
      count: 1,
      data: user,
    }));
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
    data: User;
  }> {
    return this.userService.update(id, updateUserDto).then((user) => ({
      success: true,
      message: 'User berhasil diperbarui',
      statusCode: HttpStatus.OK,
      data: user,
    }));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
    data: User;
  }> {
    return this.userService.remove(id).then((user) => ({
      success: true,
      message: 'User berhasil dihapus',
      statusCode: HttpStatus.OK,
      data: user,
    }));
  }
}
