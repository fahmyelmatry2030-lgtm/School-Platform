import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { GradebookService } from './gradebook.service';
import { GradebookController } from './gradebook.controller';

@Module({
  imports: [PrismaModule],
  providers: [AssignmentsService, QuestionsService, SubmissionsService, GradebookService],
  controllers: [AssignmentsController, QuestionsController, SubmissionsController, GradebookController],
})
export class AssessmentsModule {}
