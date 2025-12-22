import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminEmail = 'admin@school.local';
  const adminPass = 'Admin123!';
  const passwordHash = await argon2.hash(adminPass);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.ADMIN,
      firstName: 'System',
      lastName: 'Admin',
      locale: 'en',
    },
  });

  // Grades
  const grade7 = await prisma.grade.upsert({
    where: { name: 'Grade 7' },
    update: {},
    create: { name: 'Grade 7' },
  });
  const grade8 = await prisma.grade.upsert({
    where: { name: 'Grade 8' },
    update: {},
    create: { name: 'Grade 8' },
  });

  // Subjects
  const math = await prisma.subject.upsert({
    where: { name: 'Math' },
    update: {},
    create: { name: 'Math', code: 'MATH' },
  });
  const science = await prisma.subject.upsert({
    where: { name: 'Science' },
    update: {},
    create: { name: 'Science', code: 'SCI' },
  });

  // Classes (uses compound unique @@unique([name, gradeId]))
  const c7A = await prisma.class.upsert({
    where: { name_gradeId: { name: '7A', gradeId: grade7.id } },
    update: {},
    create: { name: '7A', gradeId: grade7.id, homeroomTeacherId: null },
  });

  const c8A = await prisma.class.upsert({
    where: { name_gradeId: { name: '8A', gradeId: grade8.id } },
    update: {},
    create: { name: '8A', gradeId: grade8.id, homeroomTeacherId: null },
  });

  console.log('Seed done:', { admin: admin.email, grade7: grade7.name, grade8: grade8.name, math: math.name, science: science.name, c7A: c7A?.name, c8A: c8A?.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
