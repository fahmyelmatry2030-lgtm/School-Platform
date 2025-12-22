import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UnitsService } from './units.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('units')
export class UnitsController {
  constructor(private readonly units: UnitsService) {}

  @Get('subject/:subjectId')
  async listBySubject(@Param('subjectId') subjectId: string) {
    return this.units.listBySubject(subjectId);
  }

  @Roles('TEACHER', 'ADMIN')
  @Post()
  async create(@Body() body: { subjectId: string; title: string; orderIndex?: number }) {
    return this.units.create(body.subjectId, body.title, body.orderIndex ?? 0);
  }

  @Roles('TEACHER', 'ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { title?: string; orderIndex?: number }) {
    return this.units.update(id, body);
  }

  @Roles('TEACHER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.units.remove(id);
  }
}
