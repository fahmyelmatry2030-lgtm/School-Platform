import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export type RoleType = 'ADMIN' | 'TEACHER' | 'STUDENT';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
