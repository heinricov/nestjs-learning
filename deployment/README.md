1. Setup project
   pastikan sudah menginstal nestjs cli, jika belum install dengan perintah berikut:

```bash
npm install -g @nestjs/cli
```

```bash
nest new project-name
```

2. Install dependencies

```bash
cd project-name
npm install dotenv
```

3. buat file `.env` di root project

```bash
touch .env
```

4. isi file `.env` dengan variabel environment yang dibutuhkan, misalnya:

```bash
PORT=3000
```

5. import dotenv di file `main.ts`

```typescript
import dotenv from 'dotenv';
dotenv.config();
```

6. gunakan variabel environment di file `main.ts`

```typescript
const port = parseInt(process.env.PORT, 10) || 3000;
```

7. buat file `vercel.json` di root project, isi dengan konfigurasi berikut:

```bash
touch vercel.json
```

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts",
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
  ]
}
```

8. push project ke repository github
9. Masuk ke Vercel Dashboard dan klik "New Project"
10. Impor repositori tersebut.
11. copy semua isi yang ada di file `.env` .
12. Masukkan Environment Variables lalu pastekan isi file `.env` ke dalam field "Value".
13. Klik Deploy.
14. jika berhasil, akan muncul seperti ini.
    ![sukses-deploy.png](sukses-deploy.png)
