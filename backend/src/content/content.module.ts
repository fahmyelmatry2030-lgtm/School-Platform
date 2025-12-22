import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UnitsService } from './units.service';
import { UnitsController } from './units.controller';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { ContentAssetsService } from './content-assets.service';
import { ContentAssetsController } from './content-assets.controller';

@Module({
  imports: [PrismaModule],
  providers: [UnitsService, LessonsService, ContentAssetsService],
  controllers: [UnitsController, LessonsController, ContentAssetsController],
})
export class ContentModule {}
