import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

// Generic helpers
export async function listCollection<T = any>(path: string) {
  const q = query(collection(db, path));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
}

export async function createDoc<T = any>(path: string, data: T, id?: string) {
  if (id) {
    await setDoc(doc(db, path, id), { ...data, createdAt: serverTimestamp() } as any);
    return { id };
  }
  const ref = await addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() } as any);
  return { id: ref.id };
}

export async function updateDocById<T = any>(path: string, id: string, data: Partial<T>) {
  await updateDoc(doc(db, path, id), data as any);
}

export async function deleteDocById(path: string, id: string) {
  await deleteDoc(doc(db, path, id));
}

// Domain-specific shortcuts
export const Grades = {
  list: () => listCollection<{ id: string; name: string }>('grades'),
  create: (name: string) => createDoc('grades', { name }),
  update: (id: string, name: string) => updateDocById('grades', id, { name }),
  remove: (id: string) => deleteDocById('grades', id),
};

export const Subjects = {
  list: () => listCollection<{ id: string; name: string; code?: string }>('subjects'),
  create: (name: string, code?: string) => createDoc('subjects', { name, code: code ?? null }),
  update: (id: string, name: string, code?: string) => updateDocById('subjects', id, { name, code: code ?? null }),
  remove: (id: string) => deleteDocById('subjects', id),
};

export const Classes = {
  list: () => listCollection<{ id: string; name: string; gradeId: string; homeroomTeacherId?: string | null }>('classes'),
  create: (name: string, gradeId: string, homeroomTeacherId?: string | null) =>
    createDoc('classes', { name, gradeId, homeroomTeacherId: homeroomTeacherId ?? null }),
  update: (id: string, data: { name?: string; gradeId?: string; homeroomTeacherId?: string | null }) =>
    updateDocById('classes', id, data),
  remove: (id: string) => deleteDocById('classes', id),
};

export const Users = {
  list: () => listCollection<{ id: string; email: string; role: 'ADMIN' | 'TEACHER' | 'STUDENT'; firstName: string; lastName: string; active: boolean }>('users'),
  update: (id: string, data: Partial<{ role: string; firstName: string; lastName: string; active: boolean }>) =>
    updateDocById('users', id, data),
  remove: (id: string) => deleteDocById('users', id),
};
