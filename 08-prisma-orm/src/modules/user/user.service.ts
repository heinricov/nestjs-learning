import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  /* Membuat user baru di database */
  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.users.create({
        data: {
          username: createUserDto.username,
          email: createUserDto.email,
          updatedAt: new Date(),
        },
      });
      return user;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'code' in error) {
        const code = (error as { code?: string }).code;
        if (code === 'P2002') {
          throw new ConflictException('Username atau email sudah digunakan');
        }
      }
      throw error;
    }
  }

  /* Mengambil semua user dari database */
  async findAll() {
    const [items, count, agg] = await this.prisma.$transaction([
      this.prisma.users.findMany(),
      this.prisma.users.count(),
      this.prisma.users.aggregate({ _max: { updatedAt: true } }),
    ]);
    const updatedAt = agg._max.updatedAt ?? null;
    return { items, count, updatedAt };
  }

  /* Mengambil satu user berdasarkan ID */
  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    return user;
  }

  /* Memperbarui data user berdasarkan ID */
  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const data: Record<string, any> = {};
      if (typeof updateUserDto.username !== 'undefined') {
        data.username = updateUserDto.username;
      }
      if (typeof updateUserDto.email !== 'undefined') {
        data.email = updateUserDto.email;
      }
      data.updatedAt = new Date();
      const user = await this.prisma.users.update({
        where: { id },
        data,
      });
      return user;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'code' in error) {
        const code = (error as { code?: string }).code;
        if (code === 'P2025') {
          throw new NotFoundException('User tidak ditemukan');
        }
        if (code === 'P2002') {
          throw new ConflictException('Username atau email sudah digunakan');
        }
      }
      throw error;
    }
  }

  /* Menghapus user berdasarkan ID */
  async remove(id: number) {
    try {
      const deleted = await this.prisma.users.delete({ where: { id } });
      return deleted;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'code' in error) {
        const code = (error as { code?: string }).code;
        if (code === 'P2025') {
          throw new NotFoundException('User tidak ditemukan');
        }
      }
      throw error;
    }
  }
}
