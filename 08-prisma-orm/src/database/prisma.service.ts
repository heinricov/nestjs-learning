// src/database/prisma.service.ts
import 'dotenv/config';
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        'DATABASE_URL tidak ditemukan. Pastikan environment sudah di-load.',
      );
    }
    const lower = url.toLowerCase();
    const isAccelerate =
      lower.startsWith('prisma://') || lower.startsWith('prisma+postgres://');
    if (isAccelerate) {
      super({ accelerateUrl: url });
      this.logger.log('PrismaClient menggunakan Accelerate URL');
      return;
    }
    const adapter = new PrismaPg({
      connectionString: url,
    });
    super({ adapter });
    this.logger.log('PrismaClient menggunakan Postgres adapter');
  }

  async onModuleInit() {
    this.logger.log('Attempting to connect to database...');
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
