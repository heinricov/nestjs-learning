import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<{
    success: boolean;
    message: string;
    statusCode: number;
    count: number;
    data: User[];
    updatedAt: string;
  }> {
    const users = await this.userService.findAll();
    const last = this.userService.getLastChangeAt(users).toISOString();
    return {
      success: true,
      message: 'Daftar users berhasil diambil',
      statusCode: HttpStatus.OK,
      count: users.length,
      updatedAt: last,
      data: users,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; status: number; id: string }> {
    await this.userService.remove(id);
    return {
      message: 'User berhasil dihapus',
      status: HttpStatus.OK,
      id,
    };
  }
}
