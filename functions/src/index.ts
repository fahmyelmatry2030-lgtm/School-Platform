import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

admin.initializeApp();

// HTTPS callable to set a user's role via custom claims (Admin only)
export const setUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }
  const caller = await admin.auth().getUser(context.auth.uid);
  const callerRole = (caller.customClaims?.['role'] as string | undefined) || 'STUDENT';
  if (callerRole !== 'ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Only admin can set roles');
  }
  const { uid, role } = data as { uid: string; role: 'ADMIN'|'TEACHER'|'STUDENT' };
  if (!uid || !role) {
    throw new functions.https.HttpsError('invalid-argument', 'uid and role are required');
  }
  await admin.auth().setCustomUserClaims(uid, { role });
  return { success: true };
});

// Trigger: on user creation -> set default role STUDENT and create user doc
export const onAuthCreate = functions.auth.user().onCreate(async (user) => {
  const role = 'STUDENT';
  await admin.auth().setCustomUserClaims(user.uid, { role });
  const db = admin.firestore();
  await db.collection('users').doc(user.uid).set({
    email: user.email ?? '',
    role,
    displayName: user.displayName ?? '',
    locale: 'en',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
