import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UploadFileDto } from './dto/upload-file.dto';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { FilesRepository, FileRecord } from './files.repository';
import { PatchFileDto } from './dto/patch-file.dto';
import { put, del, copy } from '@vercel/blob';

@Injectable()
export class FilesService {
  constructor(private readonly repo: FilesRepository) {}

  async handleUpload(file: Express.Multer.File, dto: UploadFileDto) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    const targetFolder =
      dto.folder && /^[a-zA-Z0-9_-]+$/.test(dto.folder)
        ? dto.folder
        : 'general';
    const uniqueBase = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const filename = uniqueBase + ext;
    const pathname = `${targetFolder}/${filename}`;
    const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
    if (!token) {
      throw new BadRequestException(
        'Token BLOB_READ_WRITE_TOKEN tidak tersedia',
      );
    }
    const uploaded = await put(pathname, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
      token,
      addRandomSuffix: false,
    });

    const id = randomUUID();
    const record: FileRecord = {
      id,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder: targetFolder,
      url: uploaded.url,
      blobPathname: uploaded.pathname,
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

  async patchById(id: string, dto: PatchFileDto) {
    const rec = this.repo.findById(id);
    if (!rec) throw new NotFoundException('File tidak ditemukan');

    let nextFolder = rec.folder;
    if (dto.folder && /^[a-zA-Z0-9_-]+$/.test(dto.folder)) {
      nextFolder = dto.folder;
    }

    if (nextFolder !== rec.folder && rec.blobPathname) {
      const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
      if (!token) {
        throw new BadRequestException(
          'Token BLOB_READ_WRITE_TOKEN tidak tersedia',
        );
      }
      const toPathname = `${nextFolder}/${rec.filename}`;
      const copied = await copy(rec.blobPathname, toPathname, {
        access: 'public',
        contentType: rec.mimetype,
        token,
      });
      await del(rec.blobPathname, { token });
      const updated = this.repo.update(id, {
        folder: nextFolder,
        url: copied.url,
        blobPathname: copied.pathname,
        description: dto.description ?? rec.description,
      });
      return updated;
    }

    const updated = this.repo.update(id, {
      folder: nextFolder,
      description: dto.description ?? rec.description,
    });
    return updated;
  }

  deleteById(id: string) {
    const rec = this.repo.findById(id);
    if (!rec) throw new NotFoundException('File tidak ditemukan');
    const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
    if (!token) {
      throw new BadRequestException(
        'Token BLOB_READ_WRITE_TOKEN tidak tersedia',
      );
    }
    if (rec.blobPathname) {
      void del(rec.blobPathname, { token });
    }
    this.repo.removeById(id);
    return { message: 'Delete berhasil', id };
  }

  deleteAll() {
    const all = this.repo.getAll();
    for (const rec of all) {
      const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
      if (token) {
        if (rec.blobPathname) {
          void del(rec.blobPathname, { token });
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
      const token = process.env.BLOB_READ_WRITE_TOKEN ?? '';
      if (token) {
        if (rec.blobPathname) {
          void del(rec.blobPathname, { token });
        }
      }
    }
    return {
      message: 'Delete file by folder berhasil',
      folder: valid,
      count: removed.length,
    };
  }
}
