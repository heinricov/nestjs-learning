import 'dotenv/config';
import { spawn } from 'child_process';
import { join } from 'path';
import { mkdir, readdir, stat } from 'fs/promises';
import { cleanMigrations } from './migration-clean';

const runCommand = (
  command: string,
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> =>
  new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });

    let stderr = '';
    let stdout = '';
    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });

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

const run = async (): Promise<void> => {
  const argv = process.env.npm_config_argv;
  const parsed = argv ? (JSON.parse(argv) as { original: string[] }) : null;
  const originalArgs = parsed?.original ?? [];
  const isRemove =
    originalArgs.includes('remove') || process.argv.includes('remove');

  if (isRemove) {
    const removed = await cleanMigrations();
    console.log(`Migration dihapus: ${removed} file`);
    return;
  }

  if (!(await hasEntity(rootSrc))) {
    console.log('FIle Entity Not Exixting');
    return;
  }

  const name = process.env.npm_config_name || 'Migration';
  const migrationPath = join('src', 'database', 'migrations', name);

  await mkdir(migrationsDir, { recursive: true });

  const result = await runCommand(process.execPath, [
    '-r',
    'ts-node/register',
    '-r',
    'tsconfig-paths/register',
    './node_modules/typeorm/cli.js',
    '-d',
    'src/database/typeormConfig.ts',
    'migration:generate',
    migrationPath,
  ]);

  if (result.code !== 0) {
    const noChanges =
      result.stdout.includes('No changes in database schema were found') ||
      result.stderr.includes('No changes in database schema were found');
    if (noChanges) {
      console.log('FIle Entity Not Exixting');
    } else if (!(await hasEntity(rootSrc))) {
      console.log('FIle Entity Not Exixting');
    }
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`Perintah gagal dengan kode ${result.code}`);
  }

  await runCommand('npm', ['run', '-s', 'format:migrations']);

  console.log(`Migration berhasil dibuat: ${migrationPath}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
