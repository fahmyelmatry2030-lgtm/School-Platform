import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async add(assignmentId: string, data: { type: 'MCQ'|'SHORT'|'TRUE_FALSE'; prompt: string; options?: any; answerKey?: any; points?: number; language?: string }) {
    try {
      return await this.prisma.question.create({
        data: {
          assignmentId,
          type: data.type,
          prompt: data.prompt,
          options: data.options ?? undefined,
          answerKey: data.answerKey ?? undefined,
          points: data.points ?? 1,
          language: data.language ?? 'en',
        },
      });
    } catch (e) {
      if ((e as any)?.code === 'P2003') throw new ConflictException('Invalid assignment reference');
      throw e;
    }
  }

  async listByAssignment(assignmentId: string) {
    return this.prisma.question.findMany({ where: { assignmentId } });
  }

  async update(id: string, data: { prompt?: string; options?: any; answerKey?: any; points?: number; language?: string }) {
    try {
      return await this.prisma.question.update({ where: { id }, data });
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Question not found');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.question.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Question not found');
      throw e;
    }
  }
}
