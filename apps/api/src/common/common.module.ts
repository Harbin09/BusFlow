import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma.module';

/**
 * CommonModule provides shared services and utilities
 */
@Module({
  imports: [PrismaModule],
  exports: [PrismaModule],
})
export class CommonModule {}
