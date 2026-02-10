import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { join, relative, sep } from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { FilesRepository, FileRecord } from './files.repository';
import { PatchFileDto } from './dto/patch-file.dto';

@Injectable()
export class FilesService {
  private readonly uploadRoot = 'uploads';

  constructor(private readonly repo: FilesRepository) {}

  handleUpload(file: Express.Multer.File, dto: UploadFileDto) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const requestedFolder =
      dto.folder && /^[a-zA-Z0-9_-]+$/.test(dto.folder)
        ? dto.folder
        : 'general';
    const actualRel = relative(this.uploadRoot, file.destination ?? '');
    const actualFolder =
      actualRel && actualRel.length > 0 ? actualRel.split(sep)[0] : 'general';
    const targetFolder = requestedFolder || actualFolder || 'general';
    const targetPath = join(this.uploadRoot, targetFolder);

    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    const currentPath = join(
      file.destination ?? this.uploadRoot,
      file.filename,
    );
    const desiredPath = join(targetPath, file.filename);
    if (currentPath !== desiredPath) {
      try {
        fs.renameSync(currentPath, desiredPath);
      } catch {
        // noop: jika gagal memindahkan, tetap lanjut dengan lokasi awal
      }
    }

    const id = randomUUID();
    const record: FileRecord = {
      id,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder: targetFolder,
      url: `/${this.uploadRoot}/${targetFolder}/${file.filename}`,
      description: dto.description ?? null,
      createdAt: Date.now(),
    };
    this.repo.add(record);

    return { message: 'Upload berhasil', ...record };
  }

  getAll() {
    return this.repo.getAll();
  }

  getByFolder(folder: string) {
    const valid = /^[a-zA-Z0-9_-]+$/.test(folder) ? folder : 'general';
    return this.repo.getByFolder(valid);
  }

  getById(id: string) {
    const rec = this.repo.findById(id);
    if (!rec) throw new NotFoundException('File tidak ditemukan');
    return rec;
  }

  patchById(id: string, dto: PatchFileDto) {
    const rec = this.repo.findById(id);
    if (!rec) throw new NotFoundException('File tidak ditemukan');

    let nextFolder = rec.folder;
    if (dto.folder && /^[a-zA-Z0-9_-]+$/.test(dto.folder)) {
      nextFolder = dto.folder;
    }

    if (nextFolder !== rec.folder) {
      const fromPath = join(this.uploadRoot, rec.folder, rec.filename);
      const toDir = join(this.uploadRoot, nextFolder);
      if (!fs.existsSync(toDir)) fs.mkdirSync(toDir, { recursive: true });
      const toPath = join(toDir, rec.filename);
      if (fs.existsSync(fromPath)) {
        fs.renameSync(fromPath, toPath);
      }
    }

    const updated = this.repo.update(id, {
      folder: nextFolder,
      url: `/${this.uploadRoot}/${nextFolder}/${rec.filename}`,
      description: dto.description ?? rec.description,
    });
    return updated;
  }

  deleteById(id: string) {
    const rec = this.repo.findById(id);
    if (!rec) throw new NotFoundException('File tidak ditemukan');
    const filePath = join(this.uploadRoot, rec.folder, rec.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore
      }
    }
    this.repo.removeById(id);
    return { message: 'Delete berhasil', id };
  }

  deleteAll() {
    const all = this.repo.getAll();
    const folders = new Set<string>();
    for (const rec of all) {
      const filePath = join(this.uploadRoot, rec.folder, rec.filename);
      folders.add(rec.folder);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore
        }
      }
    }
    for (const folder of folders) {
      const dir = join(this.uploadRoot, folder);
      if (fs.existsSync(dir)) {
        try {
          // hapus folder beserta isi (jika ada sisa)
          fs.rmSync(dir, { recursive: true, force: true });
        } catch {
          // ignore
        }
      }
    }
    this.repo.clearAll();
    return { message: 'Delete semua file berhasil', count: all.length };
  }

  deleteByFolder(folder: string) {
    const valid = /^[a-zA-Z0-9_-]+$/.test(folder) ? folder : 'general';
    const removed = this.repo.removeByFolder(valid);
    for (const rec of removed) {
      const filePath = join(this.uploadRoot, rec.folder, rec.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore
        }
      }
    }
    // hapus folder setelah file dihapus
    const dir = join(this.uploadRoot, valid);
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
    return {
      message: 'Delete file by folder berhasil',
      folder: valid,
      count: removed.length,
    };
  }
}
