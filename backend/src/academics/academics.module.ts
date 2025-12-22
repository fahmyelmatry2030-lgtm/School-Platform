import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  imports: [PrismaModule],
  controllers: [GradesController, SubjectsController, ClassesController],
  providers: [GradesService, SubjectsService, ClassesService],
})
export class AcademicsModule {}
