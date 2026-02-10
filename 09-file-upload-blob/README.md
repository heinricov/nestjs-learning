## Upload File ke Vercel Blob (NestJS)

Panduan ini menjelaskan setup yang digunakan di proyek ini untuk menyimpan file ke Vercel Blob menggunakan SDK resmi.

### Instalasi

- Dependensi utama:

```bash
npm i @vercel/blob dotenv
```

- Dependensi validasi (sudah dipakai di proyek):

```bash
npm i class-validator class-transformer
```

- Tipe Multer (sudah dipakai di proyek):

```bash
npm i -D @types/multer
```

### Konfigurasi Environment

- Buat file `.env` di root proyek dan isi:

```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_read_write_token
```

- Alternatif tanpa `.env` saat menjalankan lokal:

```bash
BLOB_READ_WRITE_TOKEN="your_vercel_blob_read_write_token" npm run start:dev
```

- Token JANGAN dikomit ke repository. `.gitignore` sudah mengabaikan file `.env`.

### Perubahan Kode Utama

- Controller memakai `memoryStorage` agar file tersedia sebagai buffer untuk diunggah ke Blob.
  - Lihat: [files.controller.ts](file:///Users/heinricov/Project/Codingan/nestjs/09-file-upload-blob/src/files/files.controller.ts)
- Service upload menggunakan SDK `@vercel/blob`:
  - Upload: `put(pathname, file.buffer, { access: 'public', token, contentType })`
  - Pindah folder: `copy(oldPathname, newPathname, ...)` lalu `del(oldPathname)`
  - Hapus: `del(pathname)`
  - Lihat: [files.service.ts](file:///Users/heinricov/Project/Codingan/nestjs/09-file-upload-blob/src/files/files.service.ts)
- main.ts memuat `.env`:
  - Lihat: [main.ts](file:///Users/heinricov/Project/Codingan/nestjs/09-file-upload-blob/src/main.ts)
- Metadata file tetap disimpan lokal di `uploads/.meta/files.json` dengan field tambahan `blobPathname`.
  - Lihat: [files.repository.ts](file:///Users/heinricov/Project/Codingan/nestjs/09-file-upload-blob/src/files/files.repository.ts)

### Endpoint HTTP

- GET `/files` — daftar semua file (metadata).
- GET `/files/folder/:folder` — daftar berdasarkan folder.
- GET `/files/:id` atau `/files/id/:id` — detail file berdasarkan id.
- POST `/files` — unggah file.
  - Form-data:
    - `file`: berkas yang diunggah (jpg, jpeg, png, pdf)
    - `folder` (opsional): nama folder (default `general`)
    - `description` (opsional): deskripsi singkat
- PATCH `/files/:id` atau `/files/id/:id` — pindah folder atau ubah deskripsi.
  - JSON body:
    - `folder` (opsional, regex `^[a-zA-Z0-9_-]+$`)
    - `description` (opsional)
- DELETE `/files/:id` atau `/files/id/:id` — hapus satu file.
- DELETE `/files/folder/:folder` — hapus semua file dalam folder.
- DELETE `/files` — hapus semua file.

### Contoh cURL

- Upload:

```bash
curl -X POST \
  -F "file=@/path/ke/file.png" \
  -F "folder=testing" \
  -F "description=demo" \
  http://localhost:3000/files
```

- List semua:

```bash
curl http://localhost:3000/files
```

- Get by id:

```bash
curl http://localhost:3000/files/<id>
```

- Get by folder:

```bash
curl http://localhost:3000/files/folder/testing
```

- Pindah folder:

```bash
curl -X PATCH \
  -H "Content-Type: application/json" \
  -d '{"folder":"renamed"}' \
  http://localhost:3000/files/<id>
```

- Hapus by id:

```bash
curl -X DELETE http://localhost:3000/files/<id>
```

- Hapus by folder:

```bash
curl -X DELETE http://localhost:3000/files/folder/testing
```

- Hapus semua:

```bash
curl -X DELETE http://localhost:3000/files
```

### Respons Upload (Contoh)

```json
{
  "message": "Upload berhasil",
  "id": "uuid",
  "filename": "timestamp-random.ext",
  "originalName": "asli.ext",
  "mimetype": "image/png",
  "size": 12345,
  "folder": "testing",
  "url": "https://<store>.public.blob.vercel-storage.com/testing/timestamp-random.ext",
  "blobPathname": "testing/timestamp-random.ext",
  "description": "demo",
  "createdAt": 1770700000000
}
```

### Catatan

- Jika Anda deploy di lingkungan serverless Vercel, metode “server uploads” memiliki batas ukuran request; untuk file besar, pertimbangkan “client uploads” (`@vercel/blob/client`) dan endpoint `handleUpload`.
- File lama yang tersimpan di disk sebelum migrasi tetap ada di metadata; operasi pindah/hapus Blob akan di-skip jika record belum memiliki `blobPathname`. Upload baru akan konsisten memakai Blob.
