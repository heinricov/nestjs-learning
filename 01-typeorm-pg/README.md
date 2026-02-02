# Tech Stack

- NestJS
- TypeORM
- PostgreSQL

# Paket yang Dipasang

- Runtime
  - @nestjs/typeorm
  - typeorm
  - pg
  - reflect-metadata
  - dotenv
- Dev
  - @types/node

## Perintah Instalasi

```bash
npm install @nestjs/typeorm typeorm pg reflect-metadata dotenv
npm install -D @types/node
```

# File yang Ditambahkan/Diperbarui

- Ditambahkan: [`src/database/typeormConfig.ts`](./src/database/typeormConfig.ts)

```bash
mkdir src/database
touch src/database/typeormConfig.ts
```

- Konfigurasi TypeORM berbasis environment (PostgreSQL).
- autoLoadEntities aktif, siap memuat entity secara otomatis.
- mendukung pola `entities` dan `migrations`.
- Ditambahkan: [`src/.env`](/nestjs-typeorm-pg/src/.env)

```bash
touch .env
```

- Variabel: PORT, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, DB_SYNCHRONIZE.
- Diperbarui: [`src/app.module.ts`](/nestjs-typeorm-pg/src/app.module.ts)
  - Menambahkan `TypeOrmModule.forRoot(typeOrmConfig)`.
- Diperbarui: [`src/main.ts`](/nestjs-typeorm-pg/src/main.ts)
  - Memuat dotenv, menambahkan handler error koneksi DB, logger minimal untuk menyembunyikan log yang tidak perlu, dan log status aplikasi (port, base URL, host DB, nama DB, endpoint).

## Menjalankan Aplikasi

```bash
# pastikan postgresql aktif dan kredensial di .env benar
npm run start:dev
```
