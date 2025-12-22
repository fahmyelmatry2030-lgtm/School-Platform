import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, RoleDto } from './dto/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto, requester: { role: string }) {
    if (requester.role !== 'ADMIN') throw new ForbiddenException('Only admin can create users');
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already used');
    const passwordHash = await argon2.hash(dto.password);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role as unknown as 'ADMIN' | 'TEACHER' | 'STUDENT',
        firstName: dto.firstName,
        lastName: dto.lastName,
        locale: dto.locale ?? 'en',
      },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, locale: true },
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true, locale: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({ select: { id: true, email: true, role: true, firstName: true, lastName: true, locale: true, active: true } });
  }
}
