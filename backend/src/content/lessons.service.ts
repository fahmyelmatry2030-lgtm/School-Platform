import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(unitId: string, title: string, orderIndex = 0) {
    try {
      return await this.prisma.lesson.create({ data: { unitId, title, orderIndex } });
    } catch (e) {
      if ((e as any)?.code === 'P2003') throw new ConflictException('Invalid unit reference');
      throw e;
    }
  }

  async listByUnit(unitId: string) {
    return this.prisma.lesson.findMany({ where: { unitId }, orderBy: { orderIndex: 'asc' } });
  }

  async update(id: string, data: { title?: string; orderIndex?: number }) {
    try {
      return await this.prisma.lesson.update({ where: { id }, data });
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Lesson not found');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.lesson.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Lesson not found');
      throw e;
    }
  }
}
