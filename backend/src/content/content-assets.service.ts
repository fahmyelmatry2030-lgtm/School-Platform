import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentAssetsService {
  constructor(private prisma: PrismaService) {}

  async create(lessonId: string, data: { type: 'PDF'|'VIDEO'|'LINK'; urlOrKey: string; title: string; language?: string; metadata?: any; version?: number }) {
    try {
      return await this.prisma.contentAsset.create({
        data: {
          lessonId,
          type: data.type,
          urlOrKey: data.urlOrKey,
          title: data.title,
          language: data.language ?? 'en',
          metadata: data.metadata ?? undefined,
          version: data.version ?? 1,
        },
      });
    } catch (e) {
      if ((e as any)?.code === 'P2003') throw new ConflictException('Invalid lesson reference');
      throw e;
    }
  }

  async listByLesson(lessonId: string) {
    return this.prisma.contentAsset.findMany({ where: { lessonId } });
  }

  async update(id: string, data: { title?: string; language?: string; metadata?: any; version?: number }) {
    try {
      return await this.prisma.contentAsset.update({ where: { id }, data });
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Content asset not found');
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.contentAsset.delete({ where: { id } });
      return { success: true };
    } catch (e) {
      if ((e as any)?.code === 'P2025') throw new NotFoundException('Content asset not found');
      throw e;
    }
  }
}
