import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { dataSourceOptions } from '../src/database/typeormConfig';
import { join } from 'path';
import { mkdir, readdir, stat } from 'fs/promises';

const rootSrc = join(process.cwd(), 'src');
const migrationsDir = join(rootSrc, 'database', 'migrations');

/**
 * Mengecek secara rekursif apakah ada file *.entity.ts di dalam folder src.
 */
const hasEntity = async (dir: string): Promise<boolean> => {
  try {
    const names = await readdir(dir);
    for (const n of names) {
      const p = join(dir, n);
      const s = await stat(p);
      if (s.isDirectory()) {
        if (await hasEntity(p)) return true;
      } else if (n.endsWith('.entity.ts')) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
};

const run = async (): Promise<void> => {
  if (!(await hasEntity(rootSrc))) {
    console.log('FIle Entity Not Exixting');
    return;
  }

  const isOptions = (v: unknown): v is DataSourceOptions =>
    !!v &&
    typeof v === 'object' &&
    'type' in v &&
    'entities' in v &&
    'migrations' in v;
  const safeOptions: DataSourceOptions = isOptions(dataSourceOptions)
    ? dataSourceOptions
    : {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME ?? 'mydatabase',
        entities: [join(rootSrc, '**', '*.entity.{ts,js}')],
        migrations: [join(rootSrc, 'database', 'migrations', '*.{ts,js}')],
        synchronize: false,
      };
  const dataSource = new DataSource({
    ...safeOptions,
    logging: ['error', 'warn', 'migration'],
  });

  await mkdir(migrationsDir, { recursive: true });
  await dataSource.initialize();
  const migrations = await dataSource.runMigrations({ transaction: 'all' });
  await dataSource.destroy();

  if (!migrations.length) {
    console.log('Tidak ada migration baru.');
    return;
  }

  console.log(
    `Migration berhasil dijalankan: ${migrations.map((m) => m.name).join(', ')}`,
  );
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
