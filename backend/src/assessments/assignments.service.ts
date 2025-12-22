import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { lessonId: string; title: string; instructions?: string; dueAt?: string | null; kind?: 'ASSIGNMENT'|'QUIZ'; settings?: any }) {
    try {
      return await this.prisma.assignment.create({
        data: {
          lessonId: data.lessonId,
          title: data.title,
          instructions: data.instructions ?? null,
          dueAt: data.dueAt ? new Date(data.dueAt) : null,
          kind: (data.kind ?? 'ASSIGNMENT'),
          settings: data.settings ?? undefined,
        },
      });
    } catch (e) {
      if ((e as any)?.code === 'P2003') throw new ConflictException('Invalid lesson reference');
      throw e;
    }
  }

  async listByLesson(lessonId: string) {
    return this.prisma.assignment.findMany({ where: { lessonId } });
  }

  async update(id: string, data: { title?: string; instructions?: string | null; dueAt?: string | null; kind?: 'ASSIGNMENT'|'QUIZ'; settings?: any }) {
    try {
      return await this.prisma.assignment.update({
        where: { id },
        data: {
          ...data,
          dueAt: data.dueAt !== undefined ? (data.dueAt ? new Date(data.dueAt) : null) : undefined,
        },
      });
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Assignment not found');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.assignment.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Assignment not found');
      throw e;
    }
  }
}
