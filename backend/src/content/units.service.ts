import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(subjectId: string, title: string, orderIndex = 0) {
    try {
      return await this.prisma.unit.create({ data: { subjectId, title, orderIndex } });
    } catch (e) {
      if ((e as any)?.code === 'P2003') throw new ConflictException('Invalid subject reference');
      throw e;
    }
  }

  async listBySubject(subjectId: string) {
    return this.prisma.unit.findMany({ where: { subjectId }, orderBy: { orderIndex: 'asc' } });
  }

  async update(id: string, data: { title?: string; orderIndex?: number }) {
    try {
      return await this.prisma.unit.update({ where: { id }, data });
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Unit not found');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.unit.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Unit not found');
      throw e;
    }
  }
}
