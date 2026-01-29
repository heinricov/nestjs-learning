import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  /**
   * Membuat user baru.
   * - Memastikan email unik.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const exists = await this.repo.findOne({
      where: { email: createUserDto.email },
    });
    if (exists) {
      throw new ConflictException('Email sudah digunakan');
    }
    const user = this.repo.create(createUserDto);
    return await this.repo.save(user);
  }

  /**
   * Mengambil semua user.
   */
  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }

  /**
   * Mengambil satu user berdasarkan ID.
   */
  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    return user;
  }

  /**
   * Memperbarui data user.
   * - Memastikan email unik jika diubah.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const dup = await this.repo.findOne({
        where: { email: updateUserDto.email },
      });
      if (dup) {
        throw new ConflictException('Email sudah digunakan');
      }
    }

    await this.repo.update(id, updateUserDto);
    return await this.findOne(id);
  }

  /**
   * Menghapus user.
   */
  async remove(id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }
    await this.repo.delete(id);
    return user;
  }
}
