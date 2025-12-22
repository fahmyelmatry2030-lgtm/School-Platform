import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Get()
  async list() {
    return this.classes.findAll();
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() body: { name: string; gradeId: string; homeroomTeacherId?: string | null }) {
    return this.classes.create(body.name, body.gradeId, body.homeroomTeacherId);
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; gradeId?: string; homeroomTeacherId?: string | null },
  ) {
    return this.classes.update(id, body);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.classes.remove(id);
  }
}
