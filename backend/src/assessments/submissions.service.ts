import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async submit(assignmentId: string, studentId: string, responses?: any) {
    try {
      return await this.prisma.submission.create({
        data: { assignmentId, studentId, responses: responses ?? undefined, status: 'SUBMITTED' },
      });
    } catch (e) {
      if ((e as any)?.code === 'P2003') throw new ConflictException('Invalid assignment or student reference');
      throw e;
    }
  }

  async listByAssignment(assignmentId: string) {
    return this.prisma.submission.findMany({ where: { assignmentId }, include: { gradeItem: true } });
  }

  async listByStudent(studentId: string) {
    return this.prisma.submission.findMany({ where: { studentId }, include: { gradeItem: true } });
  }

  async grade(submissionId: string, gradedById: string, score: number, rubric?: any) {
    try {
      const gradeItem = await this.prisma.gradeItem.upsert({
        where: { submissionId },
        update: { score, rubric: rubric ?? undefined, gradedById, gradedAt: new Date() },
        create: { submissionId, score, rubric: rubric ?? undefined, gradedById },
      });
      return gradeItem;
    } catch (e) {
      if ((e as any)?.code === 'P2003') throw new ConflictException('Invalid submission or grader reference');
      throw e;
    }
  }
}
