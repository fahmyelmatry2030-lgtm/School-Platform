import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadContent(lessonId: string, file: File) {
  const key = `content/${lessonId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, key);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);
  return { key, url };
}

export async function uploadSubmission(submissionId: string, file: File, studentId: string) {
  const key = `submissions/${submissionId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, key);
  await uploadBytes(storageRef, file, { contentType: file.type, customMetadata: { studentId } });
  const url = await getDownloadURL(storageRef);
  return { key, url };
}
