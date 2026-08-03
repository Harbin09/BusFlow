import { Module } from '@nestjs/common';
import { StudentWorkflowController } from './controllers/student-workflow.controller';
import { StudentDashboardController } from './controllers/student-dashboard.controller';
import { StudentWorkflowService } from './services/student-workflow.service';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { PrismaModule } from '../common/prisma.module';
import { TrackingModule } from '../tracking/tracking.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, TrackingModule, NotificationsModule],
  controllers: [StudentWorkflowController, StudentDashboardController, StudentsController],
  providers: [StudentWorkflowService, StudentsService],
  exports: [StudentWorkflowService, StudentsService],
})
export class StudentsModule {}
