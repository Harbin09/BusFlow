import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * PrismaService provides database access through Prisma ORM
 * Handles connection lifecycle management for Prisma 7 with Postgres Adapter
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
  console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
  console.log('Connection string:', process.env.DATABASE_URL ?? 'USING FALLBACK');

  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:Divi@1998@localhost:5432/busflow?schema=public';

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  super({ adapter });
}

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (err: any) {
      this.logger.warn(`Database connection deferred: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }
}
