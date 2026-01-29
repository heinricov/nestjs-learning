import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { hashSync, compareSync } from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { CreateUserDto, LoginDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const exists = await this.repo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email sudah digunakan');
    const salt = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
    const passwordHash: string = hashSync(dto.password, salt);
    const user = this.repo.create({
      email: dto.email,
      username: dto.username,
      password: passwordHash,
    });
    await this.repo.save(user);
    return { id: user.id, email: user.email, username: user.username };
  }

  async validateUser(email: string, password: string) {
    const user = await this.repo.findOne({
      where: { email },
      select: { id: true, email: true, username: true, password: true },
    });
    if (!user) return null;
    const match: boolean = compareSync(password, user.password);
    if (!match) return null;
    return { id: user.id, email: user.email, username: user.username };
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Email atau password salah');
    const payload = { sub: user.id, email: user.email };
    return { access_token: await this.jwt.signAsync(payload) };
  }
}
