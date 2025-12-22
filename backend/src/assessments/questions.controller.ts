import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  @Get('assignment/:assignmentId')
  async listByAssignment(@Param('assignmentId') assignmentId: string) {
    return this.questions.listByAssignment(assignmentId);
  }

  @Roles('TEACHER', 'ADMIN')
  @Post()
  async add(
    @Body() body: { assignmentId: string; type: 'MCQ'|'SHORT'|'TRUE_FALSE'; prompt: string; options?: any; answerKey?: any; points?: number; language?: string },
  ) {
    return this.questions.add(body.assignmentId, body);
  }

  @Roles('TEACHER', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { prompt?: string; options?: any; answerKey?: any; points?: number; language?: string },
  ) {
    return this.questions.update(id, body);
  }

  @Roles('TEACHER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.questions.remove(id);
  }
}
