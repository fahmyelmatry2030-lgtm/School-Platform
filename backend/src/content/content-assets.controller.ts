import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ContentAssetsService } from './content-assets.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('content-assets')
export class ContentAssetsController {
  constructor(private readonly assets: ContentAssetsService) {}

  @Get('lesson/:lessonId')
  async listByLesson(@Param('lessonId') lessonId: string) {
    return this.assets.listByLesson(lessonId);
  }

  @Roles('TEACHER', 'ADMIN')
  @Post()
  async create(
    @Body()
    body: { lessonId: string; type: 'PDF'|'VIDEO'|'LINK'; urlOrKey: string; title: string; language?: string; metadata?: any; version?: number },
  ) {
    return this.assets.create(body.lessonId, body);
  }

  @Roles('TEACHER', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; language?: string; metadata?: any; version?: number },
  ) {
    return this.assets.update(id, body);
  }

  @Roles('TEACHER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.assets.remove(id);
  }
}
