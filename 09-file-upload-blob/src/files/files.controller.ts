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
import { memoryStorage } from 'multer';
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

  @Get('id/:id')
  getById(@Param('id') id: string) {
    return this.filesService.getById(id);
  }

  @Get(':id')
  getByIdAlias(@Param('id') id: string) {
    return this.filesService.getById(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
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

  @Patch('id/:id')
  patchById(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true }))
    dto: import('./dto/patch-file.dto').PatchFileDto,
  ) {
    return this.filesService.patchById(id, dto);
  }

  @Patch(':id')
  patchByIdAlias(
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

  @Delete('folder/:folder')
  deleteByFolder(@Param('folder') folder: string) {
    return this.filesService.deleteByFolder(folder);
  }

  @Delete('id/:id')
  deleteById(@Param('id') id: string) {
    return this.filesService.deleteById(id);
  }

  @Delete(':id')
  deleteByIdAlias(@Param('id') id: string) {
    return this.filesService.deleteById(id);
  }
}
