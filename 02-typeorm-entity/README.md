# TypeORM Entity

Dokumentasi ringkas dan lengkap tentang fitur-fitur yang dapat digunakan untuk membangun entity di NestJS menggunakan TypeORM. TypeORM mendukung pola Data Mapper dan Active Record, berjalan lintas database (MySQL, PostgreSQL, MariaDB, SQLite, MS SQL Server, Oracle, MongoDB, dan lainnya), serta menyediakan API TypeScript yang elegan.

## Column

Dekorator dan opsi kolom yang tersedia untuk mendefinisikan struktur tabel:

- `@Entity(name?, options?)` untuk mendefinisikan entity dan nama tabel (opsional `orderBy`).
- `@PrimaryGeneratedColumn(strategy?)` untuk primary key otomatis. Strategi umum: `increment`, `uuid`, `rowid` (tergantung database).
- `@PrimaryColumn()` untuk primary key yang ditetapkan manual.
- `@Column(type?, options?)` untuk kolom biasa dengan opsi:
  - `type`, `length`, `precision`, `scale`
  - `nullable`, `unique`, `default`
  - `select`, `insert`, `update`
  - `enum`, `enumName` (khusus enum)
  - `array: true` (PostgreSQL), `simple-array`, `simple-json`
  - `transformer` (ValueTransformer)
  - `comment`

Contoh tipe kolom yang umum: `varchar`, `text`, `int`, `bigint`, `decimal/numeric`, `boolean`, `date`, `time`, `timestamp`, `uuid`, `json`.

## Property

Dekorator properti untuk meta-fitur entity:

- `@CreateDateColumn()` timestamp otomatis saat insert.
- `@UpdateDateColumn()` timestamp otomatis saat update.
- `@DeleteDateColumn()` soft delete (menyimpan waktu penghapusan).
- `@VersionColumn()` optimistic locking (meningkat saat update).
- `@Generated("uuid"|"increment"|"rowid")` untuk kolom biasa yang bernilai otomatis.
- `@Index()` indeks pada kolom; dapat juga di level kelas untuk indeks komposit.
- `@Unique()` constraint unik; mendukung komposit di level kelas.
- `@Check()` constraint CHECK di database.
- Embedded columns (nilai objek yang di-flatten jadi beberapa kolom).
- Table inheritance (single-table) bila diperlukan.

## Relation

Relasi antar entity dan opsi yang tersedia:

- `@OneToOne()`
- `@OneToMany()` dan `@ManyToOne()` (relasi paling umum)
- `@ManyToMany()`
- `@JoinColumn()` untuk sisi pemilik pada `OneToOne`/`ManyToOne`.
- `@JoinTable()` untuk sisi pemilik pada `ManyToMany`.
- Opsi relasi: `cascade`, `eager`, `lazy` (gunakan `Promise<...>`), `onDelete`, `onUpdate`.
- `@RelationId()` untuk menyimpan id relasi secara otomatis.

## Contoh Entity

Contoh sederhana yang menggabungkan berbagai fitur di atas:

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
  OneToOne,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity('users', { orderBy: { createdAt: 'DESC' } })
@Index(['email']) // indeks komposit dapat ditulis di level kelas
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  firstName: string;

  @Column({ type: 'varchar', length: 120 })
  lastName: string;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'simple-json', nullable: true })
  settings?: { newsletter?: boolean; theme?: 'light' | 'dark' };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @VersionColumn()
  version: number;

  @OneToOne(() => Profile, { cascade: true, eager: true })
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Post, (post) => post.author, {
    cascade: ['insert', 'update'],
  })
  posts: Post[];

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable()
  tags: Tag[];
}

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 120 })
  displayName: string;
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'SET NULL' })
  author?: User;
}

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;
}
```

Dengan kombinasi dekorator di atas, Anda dapat mendefinisikan struktur data, constraint, indeks, relasi, serta perilaku otomatis (timestamp, versi, soft delete) untuk entity di proyek NestJS berbasis TypeORM.

## Contoh Entity Tanpa Relasi

Contoh entity minimalis tanpa relasi, tetap memanfaatkan beberapa fitur kolom dan properti:

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Unique,
  Index,
  Check,
} from 'typeorm';

@Entity('products')
@Index('IDX_PRODUCTS_NAME', ['name'])
@Unique('UQ_PRODUCTS_SKU', ['sku'])
@Check('CHK_PRODUCTS_PRICE_NONNEGATIVE', 'price >= 0')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 64 })
  sku: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  price: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
```

## Contoh Entity untuk Auth

Contoh entity sederhana untuk manajemen pengguna dan otentikasi:

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Unique,
  Index,
  Check,
} from 'typeorm';

@Entity('users')
@Index('IDX_USERS_EMAIL', ['email'])
@Unique('UQ_USERS_EMAIL', ['email'])
@Check('CHK_USERS_PASSWORD_LENGTH', 'LENGTH(password) >= 8')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```
