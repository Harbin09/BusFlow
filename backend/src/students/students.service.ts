import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const students = await this.prisma.student.findMany({
      include: {
        user: true,
        route: true,
        pickupStop: true,
      },
    });

    return students.map((student) => ({
      id: student.id,
      studentNo: student.studentNo,
      name: student.user?.name || 'Unknown Student',
      email: student.user?.email || '',
      program: student.program,
      semester: `Sem ${student.semester}`,
      assignedRoute: student.route?.name || student.routeId || 'North Campus Express',
      pickupStop: student.pickupStop?.name || 'Library Complex',
      passStatus: 'ACTIVE',
    }));
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        route: true,
        pickupStop: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }
}
