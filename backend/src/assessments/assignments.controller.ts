import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignments: AssignmentsService) {}

  @Get('lesson/:lessonId')
  async listByLesson(@Param('lessonId') lessonId: string) {
    return this.assignments.listByLesson(lessonId);
  }

  @Roles('TEACHER', 'ADMIN')
  @Post()
  async create(
    @Body()
    body: { lessonId: string; title: string; instructions?: string; dueAt?: string | null; kind?: 'ASSIGNMENT'|'QUIZ'; settings?: any },
  ) {
    return this.assignments.create(body);
  }

  @Roles('TEACHER', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { title?: string; instructions?: string | null; dueAt?: string | null; kind?: 'ASSIGNMENT'|'QUIZ'; settings?: any },
  ) {
    return this.assignments.update(id, body);
  }

  @Roles('TEACHER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.assignments.remove(id);
  }
}
