import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Body,
  ValidationPipe,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { UploadFileDto } from './dto/upload-file.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  getAll() {
    return this.filesService.getAll();
  }

  @Get(':folder')
  getByFolder(@Param('folder') folder: string) {
    return this.filesService.getByFolder(folder);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.filesService.getById(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const headerRaw = req.headers['x-upload-folder'];
          let headerFolder: string | undefined = undefined;
          if (typeof headerRaw === 'string') headerFolder = headerRaw;
          else if (Array.isArray(headerRaw)) headerFolder = headerRaw[0];
          const queryFolder =
            typeof req.query?.folder === 'string'
              ? req.query.folder
              : undefined;
          const bodyFolder =
            typeof (req.body as Record<string, unknown>)['folder'] === 'string'
              ? (req.body as Record<string, string>)['folder']
              : undefined;
          let paramsFolder: string | undefined = undefined;
          const paramsAny = (req as { params?: Record<string, unknown> })
            .params;
          if (paramsAny && typeof paramsAny['folder'] === 'string') {
            paramsFolder = paramsAny['folder'];
          }
          const rawFolder =
            bodyFolder ??
            headerFolder ??
            queryFolder ??
            paramsFolder ??
            'general';
          const folder = /^[a-zA-Z0-9_-]+$/.test(rawFolder)
            ? rawFolder
            : 'general';
          const dest = join('./uploads', folder);
          if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
          }
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          return cb(
            new BadRequestException('Format file tidak diizinkan'),
            false,
          );
        }
        cb(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  /**
   * Mengunggah file ke folder dinamis dan mengembalikan metadata lengkap.
   * Field tambahan yang didukung dalam form-data:
   * - folder: nama subfolder di dalam uploads (default: general)
   * - description: deskripsi singkat file
   */
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true })) dto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('File tidak ditemukan');
    }

    return this.filesService.handleUpload(file, dto);
  }

  @Patch(':id')
  patchById(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true }))
    dto: import('./dto/patch-file.dto').PatchFileDto,
  ) {
    return this.filesService.patchById(id, dto);
  }

  @Delete()
  deleteAll() {
    return this.filesService.deleteAll();
  }

  @Delete(':folder')
  deleteByFolder(@Param('folder') folder: string) {
    return this.filesService.deleteByFolder(folder);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string) {
    return this.filesService.deleteById(id);
  }
}
