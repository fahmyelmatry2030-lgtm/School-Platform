import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
export const Assignments = {
    async list(lessonId) {
        const q = query(collection(db, `lessons/${lessonId}/assignments`), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async create(lessonId, data) {
        const ref = await addDoc(collection(db, `lessons/${lessonId}/assignments`), {
            ...data,
            kind: data.kind ?? 'ASSIGNMENT',
            createdAt: serverTimestamp(),
        });
        return { id: ref.id };
    },
    async remove(lessonId, assignmentId) {
        await deleteDoc(doc(db, `lessons/${lessonId}/assignments/${assignmentId}`));
    },
};
export const Questions = {
    async list(lessonId, assignmentId) {
        const q = query(collection(db, `lessons/${lessonId}/assignments/${assignmentId}/questions`), orderBy('points', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async add(lessonId, assignmentId, data) {
        const ref = await addDoc(collection(db, `lessons/${lessonId}/assignments/${assignmentId}/questions`), {
            ...data,
            language: data.language ?? 'en',
            points: data.points ?? 1,
        });
        return { id: ref.id };
    },
    async remove(lessonId, assignmentId, questionId) {
        await deleteDoc(doc(db, `lessons/${lessonId}/assignments/${assignmentId}/questions/${questionId}`));
    },
};
export const Submissions = {
    async listByAssignment(assignmentId) {
        const q = query(collection(db, `assignments/${assignmentId}/submissions`), orderBy('submittedAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async listMy(studentId) {
        const q = query(collection(db, 'submissions'), where('studentId', '==', studentId));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async submit(assignmentId, data) {
        const ref = await addDoc(collection(db, `assignments/${assignmentId}/submissions`), {
            ...data,
            submittedAt: serverTimestamp(),
            status: 'SUBMITTED',
        });
        return { id: ref.id };
    },
    async grade(submissionId, data) {
        await updateDoc(doc(db, `submissions/${submissionId}/gradeItem`), {
            ...data,
            gradedAt: serverTimestamp(),
        });
    },
};
