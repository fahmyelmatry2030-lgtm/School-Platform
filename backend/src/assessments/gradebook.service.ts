import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradebookService {
  constructor(private prisma: PrismaService) {}

  async byClassSubject(classId: string, subjectId: string) {
    // Basic aggregation: list students and their submissions/grades for assignments under the subject
    const assignments = await this.prisma.assignment.findMany({
      where: { lesson: { unit: { subjectId } } },
      select: { id: true, title: true },
    });
    const submissions = await this.prisma.submission.findMany({
      where: { assignmentId: { in: assignments.map((a) => a.id) } },
      include: { gradeItem: true, student: { select: { id: true, firstName: true, lastName: true } } },
    });
    return { assignments, submissions };
  }
}
