# Migration

## File yang dibutuhkan

- `src/database/typeormConfig.ts` sebagai konfigurasi TypeORM dan DataSource
- `src/database/migrations/` sebagai lokasi output migration
- `scripts/migration-generate.ts` untuk generate migration dengan output ringkas
- `scripts/migration-run.ts` untuk run migration dengan output ringkas
- `scripts/migration-revert.ts` untuk revert migration dan drop database jika kosong
- `scripts/migration-clean.ts` untuk menghapus semua file migration
- `.env` berisi `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`

## Scripts yang dibutuhkan

Tambahkan scripts berikut di `package.json`:

```json
{
  "scripts": {
    "format:migrations": "prettier --log-level silent --write \"src/database/**/*.ts\"",
    "migration:generate": "npm_config_loglevel=silent ts-node -r tsconfig-paths/register scripts/migration-generate.ts",
    "migration:run": "ts-node -r tsconfig-paths/register scripts/migration-run.ts",
    "migration:revert": "ts-node -r tsconfig-paths/register scripts/migration-revert.ts"
  }
}
```

## Cara pakai

- Generate migration:
  - `npm run migration:generate --name=CreateUsers`
- Hapus semua migration:
  - `npm run migration:generate remove`
- Jalankan migration:
  - `npm run migration:run`
- Rollback migration terakhir:
  - `npm run migration:revert`

## Catatan penting

- Pastikan database yang ada di `.env` sudah dibuat sebelum menjalankan `migration:generate` atau `migration:run`.
- Perintah `migration:generate` membutuhkan koneksi database untuk membandingkan skema.
