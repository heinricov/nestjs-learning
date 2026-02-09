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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /* Endpoint: Membuat user baru */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User berhasil dibuat',
      data,
    };
  }

  /* Endpoint: Mengambil semua user */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const { items, count, updatedAt } = await this.userService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Berhasil mengambil data user',
      count,
      updatedAt,
      data: items,
    };
  }

  /* Endpoint: Mengambil satu user berdasarkan ID */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const data = await this.userService.findOne(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Berhasil mengambil data user',
      data,
    };
  }

  /* Endpoint: Memperbarui user berdasarkan ID */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.userService.update(+id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User berhasil diperbarui',
      data,
    };
  }

  /* Endpoint: Menghapus user berdasarkan ID */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const data = await this.userService.remove(+id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User berhasil dihapus',
      data,
    };
  }
}
