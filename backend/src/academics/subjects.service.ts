import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, code?: string | null) {
    try {
      return await this.prisma.subject.create({ data: { name, code: code ?? null } });
    } catch (e) {
      if ((e as any)?.code === 'P2002') throw new ConflictException('Subject name must be unique');
      throw e;
    }
  }

  async findAll() {
    return this.prisma.subject.findMany();
  }

  async update(id: string, name: string, code?: string | null) {
    try {
      return await this.prisma.subject.update({ where: { id }, data: { name, code: code ?? null } });
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Subject not found');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.subject.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Subject not found');
      throw e;
    }
  }
}
