import { collection, getDocs, addDoc, doc, setDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const Units = {
  async list(subjectId: string) {
    const q = query(collection(db, `subjects/${subjectId}/units`), orderBy('orderIndex', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  },
  async create(subjectId: string, title: string, orderIndex = 0) {
    const ref = await addDoc(collection(db, `subjects/${subjectId}/units`), { title, orderIndex });
    return { id: ref.id };
  },
  async update(subjectId: string, unitId: string, data: Partial<{ title: string; orderIndex: number }>) {
    await updateDoc(doc(db, `subjects/${subjectId}/units/${unitId}`), data as any);
  },
  async remove(subjectId: string, unitId: string) {
    await deleteDoc(doc(db, `subjects/${subjectId}/units/${unitId}`));
  },
};

export const Lessons = {
  async list(subjectId: string, unitId: string) {
    const q = query(collection(db, `subjects/${subjectId}/units/${unitId}/lessons`), orderBy('orderIndex', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  },
  async create(subjectId: string, unitId: string, title: string, orderIndex = 0) {
    const ref = await addDoc(collection(db, `subjects/${subjectId}/units/${unitId}/lessons`), { title, orderIndex });
    return { id: ref.id };
  },
  async update(subjectId: string, unitId: string, lessonId: string, data: Partial<{ title: string; orderIndex: number }>) {
    await updateDoc(doc(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}`), data as any);
  },
  async remove(subjectId: string, unitId: string, lessonId: string) {
    await deleteDoc(doc(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}`));
  },
};

export const Assets = {
  async list(subjectId: string, unitId: string, lessonId: string) {
    const q = query(collection(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/assets`));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
  },
  async create(subjectId: string, unitId: string, lessonId: string, data: { type: 'PDF'|'VIDEO'|'LINK'; urlOrKey: string; title: string; language?: string; metadata?: any; version?: number }) {
    const ref = await addDoc(collection(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/assets`), {
      ...data,
      language: data.language ?? 'en',
      version: data.version ?? 1,
    } as any);
    return { id: ref.id };
  },
  async remove(subjectId: string, unitId: string, lessonId: string, assetId: string) {
    await deleteDoc(doc(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/assets/${assetId}`));
  },
};
