import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { GradesService } from './grades.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('grades')
export class GradesController {
  constructor(private readonly grades: GradesService) {}

  @Get()
  async list() {
    return this.grades.findAll();
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() body: { name: string }) {
    return this.grades.create(body.name);
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.grades.update(id, body.name);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.grades.remove(id);
  }
}
