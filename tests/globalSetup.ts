import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';
import { config } from 'dotenv';

const rootDir = path.resolve(__dirname, '..');
config({ path: path.join(rootDir, '.env.test') });

const dbPath = path.join(rootDir, process.env.DATABASE_URL!.replace('file:', ''));

const removeDbFiles = () => {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const file = `${dbPath}${suffix}`;
    if (existsSync(file)) rmSync(file);
  }
};

export default async function setup() {
  removeDbFiles();

  execSync('npx prisma migrate deploy', {
    cwd: rootDir,
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'inherit',
  });

  return () => {
    removeDbFiles();
  };
}
