import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get('unit/:unitId')
  async listByUnit(@Param('unitId') unitId: string) {
    return this.lessons.listByUnit(unitId);
  }

  @Roles('TEACHER', 'ADMIN')
  @Post()
  async create(@Body() body: { unitId: string; title: string; orderIndex?: number }) {
    return this.lessons.create(body.unitId, body.title, body.orderIndex ?? 0);
  }

  @Roles('TEACHER', 'ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { title?: string; orderIndex?: number }) {
    return this.lessons.update(id, body);
  }

  @Roles('TEACHER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.lessons.remove(id);
  }
}
