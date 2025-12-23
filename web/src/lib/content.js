import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
export const Units = {
    async list(subjectId) {
        const q = query(collection(db, `subjects/${subjectId}/units`), orderBy('orderIndex', 'asc'));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async create(subjectId, title, orderIndex = 0) {
        const ref = await addDoc(collection(db, `subjects/${subjectId}/units`), { title, orderIndex });
        return { id: ref.id };
    },
    async update(subjectId, unitId, data) {
        await updateDoc(doc(db, `subjects/${subjectId}/units/${unitId}`), data);
    },
    async remove(subjectId, unitId) {
        await deleteDoc(doc(db, `subjects/${subjectId}/units/${unitId}`));
    },
};
export const Lessons = {
    async list(subjectId, unitId) {
        const q = query(collection(db, `subjects/${subjectId}/units/${unitId}/lessons`), orderBy('orderIndex', 'asc'));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async create(subjectId, unitId, title, orderIndex = 0) {
        const ref = await addDoc(collection(db, `subjects/${subjectId}/units/${unitId}/lessons`), { title, orderIndex });
        return { id: ref.id };
    },
    async update(subjectId, unitId, lessonId, data) {
        await updateDoc(doc(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}`), data);
    },
    async remove(subjectId, unitId, lessonId) {
        await deleteDoc(doc(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}`));
    },
};
export const Assets = {
    async list(subjectId, unitId, lessonId) {
        const q = query(collection(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/assets`));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async create(subjectId, unitId, lessonId, data) {
        const ref = await addDoc(collection(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/assets`), {
            ...data,
            language: data.language ?? 'en',
            version: data.version ?? 1,
        });
        return { id: ref.id };
    },
    async remove(subjectId, unitId, lessonId, assetId) {
        await deleteDoc(doc(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/assets/${assetId}`));
    },
    async update(subjectId, unitId, lessonId, assetId, data) {
        await updateDoc(doc(db, `subjects/${subjectId}/units/${unitId}/lessons/${lessonId}/assets/${assetId}`), data);
    },
};
