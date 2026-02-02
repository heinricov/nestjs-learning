import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private lastChangeAt: Date | null = null;
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const entity: User = this.repo.create(createUserDto as Partial<User>);
    const saved = await this.repo.save(entity);
    this.lastChangeAt = new Date();
    return saved;
  }

  async findAll(): Promise<User[]> {
    return await this.repo.find();
  }

  async findOne(id: string): Promise<User | null> {
    return await this.repo.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.repo.update(id, updateUserDto as Partial<User>);
    const updated = await this.findOne(id);
    this.lastChangeAt = new Date();
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
    this.lastChangeAt = new Date();
  }

  getLastChangeAt(users?: User[]): Date {
    if (this.lastChangeAt) return this.lastChangeAt;
    if (users && users.length) {
      let max = users[0].updatedAt ?? users[0].createdAt;
      for (let i = 1; i < users.length; i++) {
        const t = users[i].updatedAt ?? users[i].createdAt;
        if (t > max) max = t;
      }
      return max;
    }
    return new Date(0);
  }
}
