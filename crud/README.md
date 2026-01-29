# CRUD NestJS + TypeORM + PostgreSQL

- Framework: NestJS
- ORM: TypeORM
- Database: PostgreSQL
- Utilities: dotenv, class-validator, class-transformer

## Instalasi Paket

- Runtime: @nestjs/typeorm, typeorm, pg, dotenv
- Dev: @types/node
- Validator: class-validator, class-transformer

```bash
npm install @nestjs/typeorm typeorm pg dotenv
npm install -D @types/node
npm install class-validator class-transformer
```

## Konfigurasi Environment

- Buat file .env di root:

```bash
touch .env
```

- Variabel yang digunakan:
  - DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
  - DB_SYNCHRONIZE=false
  - PORT=3000

## Konfigurasi TypeORM

- Buat folder dan file konfigurasi:

```bash
mkdir -p src/database
touch src/database/typeormConfig.ts
```

- Implementasi ada di [typeormConfig.ts](file:///Users/heinricov/Project/Codingan/nestjs/crud/src/database/typeormConfig.ts).
- Aktifkan di module utama melalui `TypeOrmModule.forRoot(typeOrmConfig)` pada [app.module.ts](file:///Users/heinricov/Project/Codingan/nestjs/crud/src/app.module.ts).

## Bootstrap Aplikasi

- Aktifkan global ValidationPipe di [main.ts](file:///Users/heinricov/Project/Codingan/nestjs/crud/src/main.ts):
  - whitelist: true
  - forbidNonWhitelisted: true
  - transform: true
- Jalankan pengembangan:

```bash
npm run start:dev
```

## Skrip Migrasi

- Format migrasi:

```bash
npm run format:migrations
```

- Generate migrasi (membuat folder src/database/migrations bila belum ada):

```bash
npm run migration:generate --name=NamaMigrasi
```

- Jika tidak ada file `.entity.ts` di dalam `src`, akan muncul pesan: FIle Entity Not Exixting
- Jika tidak ada perubahan skema, TypeORM akan menampilkan “No changes in database schema were found”

- Jalankan migrasi:

```bash
npm run migration:run
```

- Revert migrasi:

```bash
npm run migration:revert
```

## Modul User

- Struktur: `src/modules/user`
- Entity: [user.entity.ts](file:///Users/heinricov/Project/Codingan/nestjs/crud/src/modules/user/entities/user.entity.ts)
  - id: uuid (primary)
  - email: unik
  - username: string
- Module: [user.module.ts](file:///Users/heinricov/Project/Codingan/nestjs/crud/src/modules/user/user.module.ts) menggunakan `TypeOrmModule.forFeature([User])`
- Service: [user.service.ts](file:///Users/heinricov/Project/Codingan/nestjs/crud/src/modules/user/user.service.ts) dengan Repository TypeORM (CRUD lengkap + validasi unik email)
- Controller: [user.controller.ts](file:///Users/heinricov/Project/Codingan/nestjs/crud/src/modules/user/user.controller.ts) route dasar `/users`

## DTO Validasi

- CreateUserDto: email dan username tervalidasi (`IsEmail`, `IsNotEmpty`, `MinLength`, `MaxLength`)
- UpdateUserDto: turunan `PartialType(CreateUserDto)`

## Respons Endpoint

- Format konsisten:
  - success: boolean
  - message: string
  - statusCode: number
  - count: number (untuk GET)
  - data: payload
- Contoh:
  - POST /users → 201, “User berhasil dibuat”, data user
  - GET /users → 200, “Daftar user berhasil diambil”, count + data[]
  - GET /users/:id → 200, “Detail user berhasil diambil”, count=1 + data
  - PATCH /users/:id → 200, “User berhasil diperbarui”, data user
  - DELETE /users/:id → 200, “User berhasil dihapus”, data user yang dihapus
