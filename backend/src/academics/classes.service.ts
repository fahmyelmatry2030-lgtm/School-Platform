import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, gradeId: string, homeroomTeacherId?: string | null) {
    try {
      return await this.prisma.class.create({
        data: { name, gradeId, homeroomTeacherId: homeroomTeacherId ?? null },
      });
    } catch (e) {
      if ((e as any)?.code === 'P2003') throw new ConflictException('Invalid grade or teacher reference');
      throw e;
    }
  }

  async findAll() {
    return this.prisma.class.findMany({ include: { grade: true, homeroomTeacher: true } });
  }

  async update(id: string, data: { name?: string; gradeId?: string; homeroomTeacherId?: string | null }) {
    try {
      return await this.prisma.class.update({ where: { id }, data });
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Class not found');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.class.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Class not found');
      throw e;
    }
  }
}
