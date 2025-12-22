import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async enroll(userId: string, classId: string) {
    try {
      return await this.prisma.enrollment.create({ data: { userId, classId } });
    } catch (e) {
      if ((e as any)?.code === 'P2002') throw new ConflictException('User already enrolled in class');
      if ((e as any)?.code === 'P2003') throw new ConflictException('Invalid user or class');
      throw e;
    }
  }

  async listByClass(classId: string) {
    return this.prisma.enrollment.findMany({ where: { classId }, include: { user: true } });
  }

  async listByUser(userId: string) {
    return this.prisma.enrollment.findMany({ where: { userId }, include: { class: true } });
  }

  async unenroll(userId: string, classId: string) {
    try {
      await this.prisma.enrollment.delete({ where: { userId_classId: { userId, classId } } });
      return { success: true };
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Enrollment not found');
      throw e;
    }
  }
}
