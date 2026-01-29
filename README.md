# Panduan Lengkap PostgreSQL Lokal di macOS

Panduan ini akan memandu Anda melalui proses instalasi, konfigurasi, dan pengelolaan database PostgreSQL secara lokal di macOS menggunakan terminal. PostgreSQL adalah sistem manajemen database relasional open-source yang kuat, cocok untuk pengembangan aplikasi.

## Daftar Isi
1. [Persiapan Awal](#persiapan-awal)
2. [Membuat User dan Database](#membuat-user-dan-database)
3. [Mengakses Database](#mengakses-database)
4. [Manajemen Tabel](#manajemen-tabel)
5. [Melihat Isi Database](#melihat-isi-database)
6. [Mengelola Layanan PostgreSQL](#mengelola-layanan-postgresql)
7. [Rangkuman Perintah](#rangkuman-perintah)

---

## Persiapan Awal

Pastikan PostgreSQL terinstal di macOS Anda. Metode yang direkomendasikan adalah melalui Homebrew.

### 1. Memasang Homebrew
Jika belum terpasang, jalankan perintah berikut di Terminal:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Memasang PostgreSQL
Instal PostgreSQL menggunakan perintah:
```bash
brew install postgresql
```

### 3. Memulai Layanan
Jalankan layanan PostgreSQL:
```bash
brew services start postgresql
```
Verifikasi status layanan:
```bash
brew services list
```

---

## Membuat User dan Database

Secara default, PostgreSQL membuat user `postgres` tanpa password.

### Masuk ke Prompt psql
Masuk sebagai superuser default:
```bash
psql postgres
```

### Membuat User Baru
Di dalam prompt `psql` (`postgres=#`), buat user khusus untuk aplikasi Anda:
```sql
CREATE USER nama_user_baru WITH PASSWORD 'kata_sandi_aman';
```

### Membuat Database Baru
Buat database dan tetapkan pemiliknya:
```sql
CREATE DATABASE nama_database_baru OWNER nama_user_baru;
```

### Memberikan Hak Akses
Jika perlu memberikan akses penuh ke user tertentu:
```sql
GRANT ALL PRIVILEGES ON DATABASE nama_database_baru TO nama_user_baru;
```

Keluar dari psql dengan mengetik `\q`.

---

## Mengakses Database

Akses database yang baru dibuat menggunakan user yang telah ditentukan:
```bash
psql -d nama_database_baru -U nama_user_baru
```
Masukkan password saat diminta. Prompt akan berubah menjadi `nama_database_baru=>`.

---

## Manajemen Tabel

Setelah terhubung ke database, Anda dapat mengelola struktur data (DDL).

### 1. Membuat Tabel (Create)
Gunakan `CREATE TABLE` untuk mendefinisikan tabel baru.

**Sintaks Dasar:**
```sql
CREATE TABLE nama_tabel (
    kolom1 tipe_data batasan,
    kolom2 tipe_data batasan,
    ...
);
```

**Contoh:** Membuat tabel `users`.
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Mengedit Tabel (Alter)
Gunakan `ALTER TABLE` untuk mengubah struktur tabel yang sudah ada.

#### a. Menambah Kolom Baru
```sql
ALTER TABLE users ADD COLUMN phone_number VARCHAR(15);
```

#### b. Mengubah Tipe Data Kolom
```sql
ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(100);
```

#### c. Menghapus Kolom
```sql
ALTER TABLE users DROP COLUMN phone_number;
```

#### d. Mengganti Nama Kolom
```sql
ALTER TABLE users RENAME COLUMN email TO user_email;
```

### 3. Menghapus Tabel (Drop)
Untuk menghapus tabel secara permanen beserta datanya:
```sql
DROP TABLE users;
```

---

## Melihat Isi Database

Berikut adalah perintah meta (`\`) dan SQL untuk memeriksa isi database.

### Navigasi & Informasi
*   **`\l`**: Melihat daftar seluruh database.
*   **`\c nama_db`**: Pindah (connect) ke database lain.
*   **`\dt`**: Menampilkan daftar tabel di database saat ini.
*   **`\d nama_tabel`**: Melihat detail struktur (kolom, tipe data, index) tabel.

### Melihat Data (Query)
Gunakan perintah SQL standar `SELECT`.

*   **Lihat semua data:**
    ```sql
    SELECT * FROM users;
    ```
*   **Lihat 5 baris pertama saja:**
    ```sql
    SELECT * FROM users LIMIT 5;
    ```

**Tips:** Jika output terlalu panjang (muncul `:`), tekan **`q`** untuk keluar.

---

## Mengelola Layanan PostgreSQL

Perintah terminal untuk mengontrol background service PostgreSQL.

*   **Berhenti:** `brew services stop postgresql`
*   **Restart:** `brew services restart postgresql`
*   **Hapus Data (Hati-hati):** `rm -rf /usr/local/var/postgres` (Hanya jika ingin reset total)

---

## Rangkuman Perintah

Tabel berikut merangkum perintah-perintah penting yang sering digunakan.

| Kategori | Perintah / SQL | Deskripsi |
|----------|---------------|-----------|
| **Service** | `brew services start postgresql` | Menyalakan layanan |
| | `brew services stop postgresql` | Mematikan layanan |
| **Koneksi** | `psql -d [db] -U [user]` | Masuk ke database |
| | `\q` | Keluar dari psql |
| | `\c [nama_db]` | Pindah database |
| **Info** | `\l` | List semua database |
| | `\dt` | List semua tabel |
| | `\d [tabel]` | Detail struktur tabel |
| | `\du` | List semua user |
| **DDL** | `CREATE DATABASE [nama];` | Buat database |
| | `CREATE TABLE [nama] (...);` | Buat tabel |
| | `DROP TABLE [nama];` | Hapus tabel |
| | `ALTER TABLE [nama] ...;` | Edit struktur tabel |
| **DML** | `SELECT * FROM [tabel];` | Lihat data |
| | `INSERT INTO [tabel] ...;` | Tambah data |
| | `UPDATE [tabel] ...;` | Update data |
| | `DELETE FROM [tabel] ...;` | Hapus data |
