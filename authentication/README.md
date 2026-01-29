# Setup Authentication di NestJS (JWT + Passport)

Dokumentasi ini menjelaskan langkah-langkah membuat fitur Authentication berbasis JWT di NestJS dengan pola modular, TypeORM (PostgreSQL), dan validasi input. Disusun agar konsisten dengan proyek lain di folder ini yang sudah menggunakan TypeORM dan environment variables.

## Prasyarat

- Node.js dan npm (macOS)
- Nest CLI: `npm i -g @nestjs/cli`
- PostgreSQL berjalan lokal atau remote
- File `.env` berisi konfigurasi database dan auth

## Instalasi Paket

```bash
npm i @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm i class-validator class-transformer
npm i -D @types/bcrypt
```

## Variabel Lingkungan

Buat `.env` di root project:

```bash
touch .env
```

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=mydatabase
DB_SYNCHRONIZE=false

# Auth
JWT_SECRET=supersecret
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
```

## Konfigurasi TypeORM

Buat `src/database/typeormConfig.ts` mengikuti pola yang sudah digunakan di proyek lain:

```bash
mkdir -p src/database
touch src/database/typeormConfig.ts
```

```ts
import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  autoLoadEntities: true,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
};
```

Di `AppModule`, daftarkan TypeORM:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeormConfig';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig)],
})
export class AppModule {}
```

## Struktur Direktori

```text
src/
  modules/
    user/
      dto/
      entities/
      user.module.ts
      user.service.ts
      user.controller.ts
    auth/
      dto/
      strategies/
      guards/
      auth.module.ts
      auth.service.ts
      auth.controller.ts
  database/
    typeormConfig.ts
```

## Entity User

```ts
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  username: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## DTO

```ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
```

## AuthModule

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

## JwtStrategy dan Guard

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## AuthService

```ts
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { CreateUserDto, LoginDto } from './dto';

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
    const passwordHash = await bcrypt.hash(dto.password, salt);
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
    const match = await bcrypt.compare(password, user.password);
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
```

## AuthController

```ts
import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Request() req: any) {
    return req.user;
  }
}
```

## Melindungi Route Lain

```ts
@UseGuards(JwtAuthGuard)
@Get('users')
findAllUsers() { /* ... */ }
```

## Menjalankan & Uji Cepat

```bash
npm run start:dev
```

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.com","username":"alpha","password":"secret123"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@a.com","password":"secret123"}' | jq -r .access_token)

# Me
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/auth/me
```

## Catatan Migrasi

- Jika menggunakan migrations: tambahkan kolom `password` pada tabel `users`, lalu jalankan `migration:generate` dan `migration:run` sesuai skrip di proyek Anda.
- Simpan `JWT_SECRET` di environment, jangan commit ke repository.
