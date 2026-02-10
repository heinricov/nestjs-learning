import * as fs from 'fs';
import { join } from 'path';

export type FileRecord = {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  folder: string;
  url: string;
  blobPathname: string;
  description: string | null;
  createdAt: number;
};

export class FilesRepository {
  private readonly uploadRoot = 'uploads';
  private readonly metaDir = join(this.uploadRoot, '.meta');
  private readonly metaPath = join(this.metaDir, 'files.json');
  private cache: FileRecord[] | null = null;

  private ensureStore() {
    if (!fs.existsSync(this.uploadRoot)) {
      fs.mkdirSync(this.uploadRoot, { recursive: true });
    }
    if (!fs.existsSync(this.metaDir)) {
      fs.mkdirSync(this.metaDir, { recursive: true });
    }
    if (!fs.existsSync(this.metaPath)) {
      fs.writeFileSync(this.metaPath, '[]', 'utf-8');
    }
  }

  private load(): FileRecord[] {
    this.ensureStore();
    if (this.cache) return this.cache;
    const raw = fs.readFileSync(this.metaPath, 'utf-8');
    try {
      const data = JSON.parse(raw) as FileRecord[];
      this.cache = Array.isArray(data) ? data : [];
    } catch {
      this.cache = [];
    }
    return this.cache;
  }

  private save(records: FileRecord[]) {
    this.cache = records;
    fs.writeFileSync(this.metaPath, JSON.stringify(records, null, 2), 'utf-8');
  }

  getAll(): FileRecord[] {
    return this.load();
  }

  add(record: FileRecord): FileRecord {
    const records = this.load();
    records.push(record);
    this.save(records);
    return record;
  }

  findById(id: string): FileRecord | undefined {
    return this.load().find((r) => r.id === id);
  }

  update(id: string, patch: Partial<FileRecord>): FileRecord | undefined {
    const records = this.load();
    const idx = records.findIndex((r) => r.id === id);
    if (idx < 0) return undefined;
    const updated = { ...records[idx], ...patch };
    records[idx] = updated;
    this.save(records);
    return updated;
  }

  removeById(id: string): FileRecord | undefined {
    const records = this.load();
    const idx = records.findIndex((r) => r.id === id);
    if (idx < 0) return undefined;
    const [removed] = records.splice(idx, 1);
    this.save(records);
    return removed;
  }

  getByFolder(folder: string): FileRecord[] {
    return this.load().filter((r) => r.folder === folder);
  }

  removeByFolder(folder: string): FileRecord[] {
    const records = this.load();
    const removed = records.filter((r) => r.folder === folder);
    const kept = records.filter((r) => r.folder !== folder);
    this.save(kept);
    return removed;
  }

  clearAll(): FileRecord[] {
    const all = this.load();
    this.save([]);
    return all;
  }
}
