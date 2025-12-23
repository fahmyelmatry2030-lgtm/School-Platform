import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
// Generic helpers
export async function listCollection(path) {
    const q = query(collection(db, path));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function createDoc(path, data, id) {
    if (id) {
        await setDoc(doc(db, path, id), { ...data, createdAt: serverTimestamp() });
        return { id };
    }
    const ref = await addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() });
    return { id: ref.id };
}
export async function updateDocById(path, id, data) {
    await updateDoc(doc(db, path, id), data);
}
export async function deleteDocById(path, id) {
    await deleteDoc(doc(db, path, id));
}
// Domain-specific shortcuts
export const Grades = {
    list: () => listCollection('grades'),
    create: (name) => createDoc('grades', { name }),
    update: (id, name) => updateDocById('grades', id, { name }),
    remove: (id) => deleteDocById('grades', id),
};
export const Subjects = {
    list: () => listCollection('subjects'),
    create: (name, code) => createDoc('subjects', { name, code: code ?? null }),
    update: (id, name, code) => updateDocById('subjects', id, { name, code: code ?? null }),
    remove: (id) => deleteDocById('subjects', id),
};
export const Classes = {
    list: () => listCollection('classes'),
    create: (name, gradeId, homeroomTeacherId) => createDoc('classes', { name, gradeId, homeroomTeacherId: homeroomTeacherId ?? null }),
    update: (id, data) => updateDocById('classes', id, data),
    remove: (id) => deleteDocById('classes', id),
};
export const Users = {
    list: () => listCollection('users'),
    update: (id, data) => updateDocById('users', id, data),
    remove: (id) => deleteDocById('users', id),
};
