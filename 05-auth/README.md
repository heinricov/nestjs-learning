# 05-auth

## Package
- @nestjs/typeorm
- typeorm
- pg
- reflect-metadata
- dotenv
- class-transformer
- class-validator
- bcrypt
- @nestjs/jwt
- @nestjs/passport
- passport
- passport-jwt

jalankan perintah di bawah ini di terminal untuk menginstall package yang dibutuhkan:
```bash
npm install @nestjs/typeorm typeorm pg reflect-metadata dotenv
npm install -D @types/node
npm install class-transformer class-validator
npm install bcrypt @nestjs/jwt @nestjs/passport passport passport-jwt
```

## Setup TypeORM

buat file `typeormConfig.ts` di folder `src/database` dan file `.env` di root project.
```bash
mkdir src/database
touch src/database/typeormConfig.ts
touch .env
```
isi file `typeormConfig.ts` dengan kode di bawah ini:
```typescript
import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'mydatabase',
  schema: process.env.DB_SCHEMA ?? 'public',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
};

export const typeOrmConfig: TypeOrmModuleOptions = {
  ...dataSourceOptions,
  autoLoadEntities: true,
  synchronize: (process.env.DB_SYNCHRONIZE ?? 'false') === 'true',
};

export const dataSource = new DataSource(dataSourceOptions);

```

lalu isi file `.env` dengan kode di bawah ini:
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
DB_SYNCHRONIZE=false
```
>pasrikan `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` dengan nilai yang sesuai dengan database yang digunakan.

jika belum membuat database, buat database dengan perintah di bawah ini di terminal:
masuk ke database postgres dengan perintah di bawah ini:
```bash
psql postgres
```
buat user dan password dengan perintah di bawah ini:
```bash
CREATE USER myuser WITH PASSWORD 'mypassword';
```
>pasrikan `myuser` dan `mypassword` dengan nilai yang sesuai dengan database yang digunakan.
buat database dengan perintah di bawah ini:
```bash
CREATE DATABASE mydatabase;
```
buat database dengan akses user nya
```bash
CREATE DATABASE mydatabase WITH OWNER myuser;
```
>pasrikan `mydatabase` dengan nilai yang sesuai dengan database yang digunakan.
jika belum membuat user, buat user dengan perintah di bawah ini:
```bash
GRANT ALL PRIVILEGES ON DATABASE mydatabase TO myuser;
```
>pasrikan `mydatabase` dan `myuser` dengan nilai yang sesuai dengan database yang digunakan.

update file `app.module.ts` di folder `src` dengan kode di bawah ini:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './database/typeormConfig';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

update file `main.ts` di folder `src` dengan kode di bawah ini:
```typescript
import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3000);
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  console.log(`your aplikasi runing in http://localhost:${port}`);
}
void bootstrap();

```

jalankan perintah di bawah ini di terminal untuk menjalankan aplikasi:
```bash
npm run start:dev
```
`control + c` untuk menghentikan aplikasi.

## Buat Module

untuk Authentication membutuhkan module `auth` dan `user`. jalankan perintah di bawah ini di terminal untuk membuat module `auth` dan `user`:
```bash
nest g resource auth --no-spec
nest g resource user modules --no-spec
```
hapus file `auth.entity.ts` di folder `src/auth`. bisa juga hapus file `user.entity.ts` dengan cara mengikuti perintah di bawah ini:
```bash
rm -rf src/auth/entities
```

## Setup Entity

entity dengan nama `users` akan digunakan untuk menyimpan data user dengan field:
- id: primary key, auto increment
- username: unique, not null
- password: not null
- role: not null, default value: 'user'
- createdAt: not null, default value: now
- updatedAt: not null, default value: now

perbaharui file `user.entity.ts` di folder `src/modules/user/entities` dengan kode di bawah ini:
```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ default: 'user', nullable: false })
  role: string;

  @CreateDateColumn({ default: () => 'now()' })
  createdAt: Date;

  @UpdateDateColumn({ default: () => 'now()' })
  updatedAt: Date;
}

```

## Setup Migration

update file `package.json` di root project dengan kode di bawah ini, untuk menambahkan script `typeorm` untuk menjalankan migration:
```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:run": "npm run typeorm -- migration:run -d src/database/typeormConfig.ts",
    "migration:revert": "npm run typeorm -- migration:revert -d src/database/typeormConfig.ts",
    "migration:generate": "npm run typeorm -- migration:generate -d src/database/typeormConfig.ts src/database/migrations/migration && npm run format:migrations",
    "format:migrations": "prettier --write \"src/database/migrations/*.ts\" && eslint \"src/database/migrations/*.ts\" --fix"
  }
}
```
jalankan perintah di bawah ini di terminal untuk membuat file migration:
```bash
npm run migration:generate
```
jalankan perintah di bawah ini di terminal untuk menjalankan migration:
```bash
npm run migration:run
```
jalankan perintah di bawah ini di terminal untuk mengembalikan migration:
```bash
npm run migration:revert
```

## Setup endpoint
