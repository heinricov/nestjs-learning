import { readdir, unlink, mkdir, stat } from 'fs/promises';
import { join } from 'path';

const rootSrc = join(process.cwd(), 'src');
const migrationsDir = join(rootSrc, 'database', 'migrations');

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

export const cleanMigrations = async (): Promise<number> => {
  if (!(await hasEntity(rootSrc))) {
    console.log('FIle Entity Not Exixting');
    return 0;
  }
  await mkdir(migrationsDir, { recursive: true });
  const files = await readdir(migrationsDir).catch(() => []);
  const targets = files.filter((file) => file !== '.gitkeep');
  await Promise.all(targets.map((file) => unlink(join(migrationsDir, file))));
  return targets.length;
};

const run = async (): Promise<void> => {
  const removed = await cleanMigrations();
  console.log(`Migration dihapus: ${removed} file`);
};

if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
