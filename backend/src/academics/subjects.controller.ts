import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjects: SubjectsService) {}

  @Get()
  async list() {
    return this.subjects.findAll();
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() body: { name: string; code?: string | null }) {
    return this.subjects.create(body.name, body.code);
  }

  @Roles('ADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: { name: string; code?: string | null }) {
    return this.subjects.update(id, body.name, body.code);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.subjects.remove(id);
  }
}
