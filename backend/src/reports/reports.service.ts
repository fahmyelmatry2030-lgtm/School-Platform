import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async studentReport(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
      include: { assignment: { select: { title: true } }, gradeItem: true },
      orderBy: { submittedAt: 'desc' },
    });
    return { student, submissions };
  }

  async classSubjectReport(classId: string, subjectId: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: { lesson: { unit: { subjectId } } },
      select: { id: true, title: true },
    });
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId },
      select: { userId: true },
    });
    const studentIds = enrollments.map((e) => e.userId);
    const submissions = await this.prisma.submission.findMany({
      where: { assignmentId: { in: assignments.map((a) => a.id) }, studentId: { in: studentIds } },
      include: { gradeItem: true, student: { select: { id: true, firstName: true, lastName: true } } },
    });
    return { assignments, submissions };
  }
}
