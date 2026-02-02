# Setup Endpoint Users (CRUD + TypeORM)

Dokumentasi ini menjelaskan perubahan endpoint pada modul Users agar:
- Base route: `/users`
- GET `/users`: mengembalikan success, message, statusCode, count, data, dan updatedAt (waktu terakhir ada penambahan/perubahan/penghapusan data)
- POST `/users`: membuat user baru dengan validasi DTO
- PATCH `/users/:id`: memperbarui data user dengan validasi DTO
- DELETE `/users/:id`: mengembalikan pesan, status, dan id yang dihapus

## Packages yang ditambahkan

```bash
npm i class-validator class-transformer
```

## Konfigurasi ESLint (disarankan)

```mjs
// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      "prettier/prettier": ["error", { endOfLine: "auto" }],
    },
  },
);
```

## Langkah Implementasi

1. Tambahkan validasi DTO
   - File: `src/modules/user/dto/create-user.dto.ts`
   - Field: `username` (string, required, max 120), `email` (email, required), `password` (string, required, min 8)
   - File: `src/modules/user/dto/update-user.dto.ts` menggunakan `PartialType(CreateUserDto)` agar semua field opsional.

2. Integrasi TypeORM Repository
   - File: `src/modules/user/user.module.ts`
   - Tambahkan `TypeOrmModule.forFeature([User])` agar `UserService` dapat `@InjectRepository(User)`.

3. Perbarui UserService
   - File: `src/modules/user/user.service.ts`
   - Implementasi `create`, `findAll`, `findOne`, `update`, `remove` menggunakan repository.
   - Simpan `lastChangeAt` setiap kali ada operasi create/update/delete.
   - Sediakan helper `getLastChangeAt(users)` untuk menurunkan nilai `updatedAt` jika belum ada perubahan tersimpan, dihitung dari data `updatedAt/createdAt` yang ada.

4. Perbarui UserController
   - File: `src/modules/user/user.controller.ts`
   - Ganti base ke `@Controller('users')`.
   - GET `/users` mengembalikan:
     - `success`, `message`, `statusCode`, `count`, `data`, `updatedAt`.
   - DELETE `/users/:id` mengembalikan:
     - `message`, `status`, `id`.

5. Opsional: aktifkan ValidationPipe global
   - File: `src/main.ts`
   - Aktifkan:
     ```ts
     // app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
     ```

## Contoh Request

### POST `/users`

```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "secretPass123"
}
```

### PATCH `/users/:id`

```json
{
  "username": "johnny"
}
```

### DELETE `/users/:id`

Response:
```json
{
  "message": "User berhasil dihapus",
  "status": 200,
  "id": "f4e2e0b2-9abc-4c2e-91ef-1f3c2c6c7890"
}
```

### GET `/users`

Response (contoh):
```json
{
  "success": true,
  "message": "Daftar users berhasil diambil",
  "statusCode": 200,
  "count": 3,
  "data": [
    { "id": "...", "username": "...", "email": "...", "password": "...", "createdAt": "...", "updatedAt": "..." }
  ],
  "updatedAt": "2026-02-02T13:15:23.123Z"
}
```
