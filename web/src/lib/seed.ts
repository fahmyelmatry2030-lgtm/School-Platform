import { Grades, Subjects } from './firestore';

export async function seedBasics() {
  // Idempotent-ish: naive check and create if missing
  const grades = await Grades.list();
  if (!grades.find((g) => g.name === 'Grade 7')) await Grades.create('Grade 7');
  if (!grades.find((g) => g.name === 'Grade 8')) await Grades.create('Grade 8');

  const subjects = await Subjects.list();
  if (!subjects.find((s) => s.name === 'Math')) await Subjects.create('Math', 'MATH');
  if (!subjects.find((s) => s.name === 'Science')) await Subjects.create('Science', 'SCI');

  return { ok: true };
}
