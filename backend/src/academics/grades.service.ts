import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    try {
      return await this.prisma.grade.create({ data: { name } });
    } catch (e) {
      if ((e as any)?.code === 'P2002') throw new ConflictException('Grade name must be unique');
      throw e;
    }
  }

  async findAll() {
    return this.prisma.grade.findMany({ include: { classes: true } });
  }

  async update(id: string, name: string) {
    try {
      return await this.prisma.grade.update({ where: { id }, data: { name } });
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Grade not found');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.grade.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Grade not found');
      throw e;
    }
  }
}
