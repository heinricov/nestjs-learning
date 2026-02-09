# Prisma ORM

## 1. Install dependency Prisma + Postgres driver

Di project NestJS kamu:

```bash
npm install prisma --save-dev
npm install @prisma/client @prisma/adapter-pg pg
```

## 2. Inisialisasi Prisma (Prisma 7)

Jalankan perintah ini di root project NestJS kamu:

```bash
npx prisma init --db --output ../src/generated/prisma
```

- nanti akan diminta login ke Prisma Cloud
- setelah login, akan diminta konfirmasi untuk membuat project Prisma Cloud
- setelah project Prisma Cloud dibuat, akan diminta konfirmasi untuk membuat database Prisma Cloud
- setelah database Prisma Cloud dibuat, akan diminta konfirmasi untuk membuat schema Prisma Cloud

Ini akan membuat:

- folder prisma/
- prisma/schema.prisma
- prisma.config.ts
- .env (berisi DATABASE_URL) [Nest Prisma guide]
  Contoh schema.prisma awal di file [schema.prisma](prisma/schema.prisma)

## 3. Buat Model User

Buat model User di schema.prisma:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 4. Jalankan Prisma Migration

Jalankan perintah ini di root project NestJS kamu:

```bash
npx prisma migrate dev --name init
```

## 5. Jalankan Prisma Generate

Jalankan perintah ini di root project NestJS kamu:

```bash
npx prisma generate
```

## 6. Buat Prisma Service

Buat file prisma.service.ts di folder src/database/ dengan isi:

```typescript
// src/database/prisma.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });
    super({ adapter });
  }

  async onModuleInit() {
    this.logger.log('Attempting to connect to database...');
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

## 7. Ganti nama model

Ganti nama model User di prisma/schema.prisma menjadi Users:

```prisma
model users {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("user")
}
```

jalankan perintah :

```bash
npx prisma migrate dev --name rename-user-table --create-only
```

masuk ke file migration `SQL` di folder `src/database/migrations/`
lalu ganti semua isi nya dengan code berikut:

```sql
-- Rename existing table instead of dropping it
ALTER TABLE "User" RENAME TO "users";

-- (opsional, kalau index/constraint lama namanya beda dan kamu perlu sesuaikan)
-- RENAME INDEX "User_username_key" TO "user_username_key";
-- RENAME INDEX "User_email_key"   TO "user_email_key";

-- Kalau constraint primary key lama namanya beda dan kamu peduli dengan namanya:
-- ALTER TABLE "user" RENAME CONSTRAINT "User_pkey" TO "user_pkey";
```

lalu jalankan perintah berikut untuk apply migration:

```bash
npx prisma migrate dev
```

## 8. Reset Database

Jalankan perintah ini di root project NestJS kamu:

```bash
npx prisma migrate reset
```

## 9. Menambahkan kolom pada table

pada model Users, tambahkan kolom password:

```prisma
model Users {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

jalankan perintah :

```bash
npx prisma migrate dev --name add-password-column --create-only
```

masuk ke file migration `SQL` di folder `src/database/migrations/`
lalu ganti semua isi nya dengan code berikut:

```sql
-- Add a new column to the "users" table
ALTER TABLE "users" ADD COLUMN "password" TEXT;
```

lalu jalankan perintah berikut untuk apply migration:

```bash
npx prisma migrate dev
```

atau dengan hanya menjalankan perintah berikut:

```bash
npx prisma migrate dev --name add_password_to_user
```

## 10. Menghapus kolom

pada model yang ingin di hapus kolom buat berubahan :
dari

```prisma
model Users {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

menjadi

```prisma
model Users {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

jalankan perintah :

```bash
npx prisma migrate dev --name remove-password-column --create-only
```

masuk ke file migration `SQL` di folder `src/database/migrations/`
lalu ganti semua isi nya dengan code berikut:

```sql
-- Remove the "password" column from the "users" table
ALTER TABLE "users" DROP COLUMN "password";
```

lalu jalankan perintah berikut untuk apply migration:

```bash
npx prisma migrate dev
```

atau dengan hanya menjalankan perintah berikut:

```bash
npx prisma migrate dev --name remove_password_from_user
```

## 11. Perbaharui schema.prisma

pastikan `moduleFormat` di `schema.prisma` adalah `cjs`

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/database/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "postgresql"
}

```
