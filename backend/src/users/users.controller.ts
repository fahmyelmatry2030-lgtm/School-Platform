import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateUserDto, @Req() req: any) {
    return this.usersService.create(dto, req.user ?? { role: 'STUDENT' });
  }

  @Get('me')
  async me(@Req() req: any) {
    return this.usersService.me(req.user?.sub);
  }

  @Roles('ADMIN')
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}
