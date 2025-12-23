import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { db } from '../firebase';

export const Codes = {
    async generate(subjectId: string, count: number) {
        const codesCollection = collection(db, 'codes');
        const promises = [];

        for (let i = 0; i < count; i++) {
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            promises.push(addDoc(codesCollection, {
                code,
                subjectId,
                used: false,
                createdAt: serverTimestamp(),
                redeemedBy: null,
                redeemedAt: null
            }));
        }
        await Promise.all(promises);
    },

    async listBySubject(subjectId: string) {
        const q = query(collection(db, 'codes'), where('subjectId', '==', subjectId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async listAll() {
        const snap = await getDocs(collection(db, 'codes'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async redeem(studentId: string, studentName: string, codeString: string) {
        const q = query(collection(db, 'codes'), where('code', '==', codeString.toUpperCase()), where('used', '==', false));
        const snap = await getDocs(q);

        if (snap.empty) {
            throw new Error('Invalid or already used code');
        }

        const codeDoc = snap.docs[0];
        const { subjectId } = codeDoc.data();

        // 1. Mark code as used
        await updateDoc(doc(db, 'codes', codeDoc.id), {
            used: true,
            redeemedBy: studentId,
            redeemedByName: studentName,
            redeemedAt: serverTimestamp()
        });

        // 2. Enroll student in subject
        // Assuming enrollments are tracked in a sub-collection or a field
        // For now, let's add a record in a new 'enrollments' collection
        await addDoc(collection(db, 'enrollments'), {
            studentId,
            subjectId,
            enrolledAt: serverTimestamp(),
            method: 'CODE',
            code: codeString
        });

        return subjectId;
    }
};
