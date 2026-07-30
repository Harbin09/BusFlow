import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';

/**
 * PrismaModule provides database access throughout the application
 */
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
