import { Controller, Get, Query } from '@nestjs/common';
import { GradebookService } from './gradebook.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('gradebook')
export class GradebookController {
  constructor(private readonly gradebook: GradebookService) {}

  @Roles('TEACHER', 'ADMIN')
  @Get('class-subject')
  async byClassSubject(@Query('classId') classId: string, @Query('subjectId') subjectId: string) {
    return this.gradebook.byClassSubject(classId, subjectId);
  }
}
