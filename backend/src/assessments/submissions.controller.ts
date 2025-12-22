import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  async submit(
    @Body() body: { assignmentId: string; responses?: any },
    @Req() req: any,
  ) {
    const studentId = req.user?.sub as string;
    return this.submissions.submit(body.assignmentId, studentId, body.responses);
  }

  @Roles('TEACHER', 'ADMIN')
  @Get('assignment/:assignmentId')
  async listByAssignment(@Param('assignmentId') assignmentId: string) {
    return this.submissions.listByAssignment(assignmentId);
  }

  @Get('me')
  async listMySubmissions(@Req() req: any) {
    return this.submissions.listByStudent(req.user?.sub);
  }

  @Roles('TEACHER', 'ADMIN')
  @Post(':id/grade')
  async grade(
    @Param('id') submissionId: string,
    @Body() body: { score: number; rubric?: any },
    @Req() req: any,
  ) {
    return this.submissions.grade(submissionId, req.user?.sub, body.score, body.rubric);
  }
}
