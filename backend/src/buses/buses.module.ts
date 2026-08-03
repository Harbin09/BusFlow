import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { BusesController } from './buses.controller';
import { BusesService } from './buses.service';

@Module({
  imports: [PrismaModule],
  controllers: [BusesController],
  providers: [BusesService],
  exports: [BusesService],
})
export class BusesModule {}
