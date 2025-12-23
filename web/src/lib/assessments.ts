import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

export const Assignments = {
  async list(lessonId: string) {
    const q = query(collection(db, `lessons/${lessonId}/assignments`), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  },
  async create(lessonId: string, data: { title: string; instructions?: string; dueAt?: string | null; kind?: 'ASSIGNMENT' | 'QUIZ'; settings?: any }) {
    const ref = await addDoc(collection(db, `lessons/${lessonId}/assignments`), {
      ...data,
      kind: data.kind ?? 'ASSIGNMENT',
      createdAt: serverTimestamp(),
    } as any);
    return { id: ref.id };
  },
  async remove(lessonId: string, assignmentId: string) {
    await deleteDoc(doc(db, `lessons/${lessonId}/assignments/${assignmentId}`));
  },
};

export const Questions = {
  async list(lessonId: string, assignmentId: string) {
    const q = query(collection(db, `lessons/${lessonId}/assignments/${assignmentId}/questions`), orderBy('points', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  },
  async add(lessonId: string, assignmentId: string, data: { type: 'MCQ' | 'SHORT' | 'TRUE_FALSE'; prompt: string; options?: any; answerKey?: any; points?: number; language?: string }) {
    const ref = await addDoc(collection(db, `lessons/${lessonId}/assignments/${assignmentId}/questions`), {
      ...data,
      language: data.language ?? 'en',
      points: data.points ?? 1,
    } as any);
    return { id: ref.id };
  },
  async remove(lessonId: string, assignmentId: string, questionId: string) {
    await deleteDoc(doc(db, `lessons/${lessonId}/assignments/${assignmentId}/questions/${questionId}`));
  },
};

export const Submissions = {
  async listByAssignment(assignmentId: string) {
    const q = query(collection(db, `assignments/${assignmentId}/submissions`), orderBy('submittedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  },
  async listMy(studentId: string) {
    const q = query(collection(db, 'submissions'), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  },
  async submit(assignmentId: string, data: { studentId: string; studentName: string; answers: any; fileUrl?: string }) {
    const ref = await addDoc(collection(db, `assignments/${assignmentId}/submissions`), {
      ...data,
      submittedAt: serverTimestamp(),
      status: 'SUBMITTED',
    } as any);
    return { id: ref.id };
  },
  async grade(submissionId: string, data: { score: number; rubric?: any }) {
    await updateDoc(doc(db, `submissions/${submissionId}/gradeItem`), {
      ...data,
      gradedAt: serverTimestamp(),
    } as any);
  },
};
