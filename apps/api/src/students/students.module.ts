import { Module } from '@nestjs/common';
import { StudentWorkflowController } from './controllers/student-workflow.controller';
import { StudentWorkflowService } from './services/student-workflow.service';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PrismaModule } from '../common/prisma.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [PrismaModule, TrackingModule],
  controllers: [StudentWorkflowController, StudentsController],
  providers: [StudentWorkflowService, StudentsService],
  exports: [StudentWorkflowService, StudentsService],
})
export class StudentsModule {}
