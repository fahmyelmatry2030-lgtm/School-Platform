# دليل إعداد منصة المدرسة التعليمية - School Platform Setup Guide

## المتطلبات الأساسية

- Node.js (النسخة 16 أو أحدث)
- حساب Firebase (مجاني)
- محرر نصوص (VS Code، Sublime، إلخ)

##  إعداد Firebase

### 1. إنشاء مشروع Firebase

1. انتقل إلى [Firebase Console](https://console.firebase.google.com/)
2. انقر على "إضافة مشروع" (Add Project)
3. أدخل اسم المشروع (مثلاً: "school-platform")
4. اختر ما إذا كنت تريد تفعيل Google Analytics (اختياري)
5. انقر على "إنشاء مشروع" (Create Project)

### 2. تكوين التطبيق Web

1. في لوحة تحكم Firebase، انقر على أيقونة الويب `</>`
2. أدخل اسماً للتطبيق (مثلاً: "school-web")
3. **اختر "Firebase Hosting"** إذا أردت استضافة المشروع على Firebase
4. انقر على "تسجيل التطبيق"
5. **انسخ بيانات التكوين** التي ستظهر (سنحتاجها لاحقاً)

```javascript
// مثال على بيانات التكوين
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "school-platform.firebaseapp.com",
 projectId: "school-platform",
  storageBucket: "school-platform.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
};
```

### 3. تفعيل Firebase Authentication

1. في القائمة الجانبية، اختر "Build" > "Authentication"
2. انقر على "Get Started"
3. اختر "Email/Password" من قائمة Sign-in methods
4. فعّل "Email/Password" واضغط "Save"

### 4. تفعيل Cloud Firestore

1. في القائمة الجانبية، اختر "Build" > "Firestore Database"
2. انقر على "Create Database"
3. اختر **"Start in Production Mode"** (سنرفع قواعد الأمان لاحقاً)
4. اختر موقع الخادم (يُفضل الأقرب لموقعك الجغرافي)
5. انقر فوق "Enable"

### 5. تفعيل Cloud Storage

1. في القائمة الجانبية، اختر "Build" > "Storage"
2. انقر على "Get Started"
3. اختر **"Start in Production Mode"**
4. اختر الموقع نفسه الذي اخترته لـ Firestore
5. انقر على "Done"

## تكوين المشروع المحلي

### 1. تثبيت المكتبات

```bash
cd web
npm install
```

### 2. إعداد ملف البيئة (.env)

1. في مجلد `web/`، انسخ ملف `.env.example` إلى `.env`:
   ```bash
   copy .env.example .env
   ```

2. افتح ملف `.env` وأضف بيانات Firebase التي نسخت قبل:

```env
# استبدل هذه القيم بالقيم الخاصة بمشروعك من Firebase Console
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=school-platform.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=school-platform
VITE_FIREBASE_STORAGE_BUCKET=school-platform.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:...
```

### 3. نشر قواعد Firestore و Storage

```bash
# من المجلد الجذر للمشروع
firebase deploy --only firestore:rules,storage:rules
```

## إنشاء مستخدمين أوليين

### استخدام Firebase Console

1. اذهب إلى "Authentication" > "Users"
2. انقر على "Add User"
3. أضف البريد الإلكتروني وكلمة المرور
4. كرر العملية لإنشاء حسابات للأدوار المختلفة:
   - **Admin**: `admin@school.local` / `Admin123!`
   - **Teacher**: `teacher@school.local` / `Teacher123!`
   - **Student**: `student@school.local` / `Student123!`

### تعيين الأدوار (Custom Claims)

لتعيين الأدوار، تحتاج لاستخدام Firebase Admin SDK. إليك طريقتان:

#### الطريقة 1: باستخدام Cloud Functions (موصى بها)

1. أنشئ ملف Cloud Function في `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();

// دالة لتعيين الأدوار يدوياً
export const setUserRole = functions.https.onCall(async (data, context) => {
  // تأكد من أن المستدعي هو admin
  if (context.auth?.token.role !== 'ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can set roles');
  }
  
  const { uid, role } = data;
  await admin.auth().setCustomUserClaims(uid, { role });
  return { success: true };
});

// دالة لتعيين الروول للمستخدم الأول كـ Admin
export const setupInitialAdmin = functions.https.onRequest(async (req, res) => {
  const email = 'admin@school.local';
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'ADMIN' });
    res.json({ success: true, message: `Admin role set for ${email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

2. نفّذ الدوال:
```bash
cd functions
npm install
npm run deploy
```

3. استدعِ الدالة من المتصفح:
```
https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/setupInitialAdmin
```

#### الطريقة 2: استخدام Firebase CLI (للبدء السريع)

1. أنشئ ملف script محلي `scripts/set-roles.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setRoles() {
  const users = [
    { email: 'admin@school.local', role: 'ADMIN' },
    { email: 'teacher@school.local', role: 'TEACHER' },
    { email: 'student@school.local', role: 'STUDENT' },
  ];

  for (const { email, role } of users) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().setCustomUserClaims(user.uid, { role });
      console.log(`✓ Set role ${role} for ${email}`);
    } catch (error) {
      console.error(`✗ Error setting role for ${email}:`, error.message);
    }
  }
}

setRoles().then(() => {
  console.log('Done!');
  process.exit(0);
});
```

2. احصل على Service Account Key:
   - Firebase Console > Project Settings > Service Accounts
   - انقر على "Generate New Private Key"
   - احفظ الملف في مجلد `scripts/`

3. نفّذ الscript:
```bash
node scripts/set-roles.js
```

## تشغيل التطبيق

### التشغيل المحلي (Development)

```bash
cd web
npm run dev
```

افتح المتصفح على `http://localhost:5173`

### البناء للإنتاج

```bash
cd web
npm run build
```

الملفات المبنية ستكون في مجلد `web/dist/`

### النشر على Firebase Hosting

```bash
# من المجلد الجذر
firebase deploy --only hosting
```

## اختبار التطبيق

1. **تسجيل الدخول كإدارة**:
   - البريد: `admin@school.local`
   - كلمة المرور: `Admin123!`
   - يجب أن تُوجّه إلى `/admin`
   - جرّب إضافة Grades، Subjects، Classes

2. **تسجيل الدخول كمعلم**:
   - البريد: `teacher@school.local`
   - كلمة المرور: `Teacher123!`
   - يجب أن تُوجّه إلى `/teacher`
   - تأكد من إمكانية إضافة Units، Lessons، Assets

3. **تسجيل الدخول كطالب**:
   - البريد: `student@school.local`
   - كلمة المرور: `Student123!`
   - يجب أن تُوجّه إلى `/student`

## حل المشاكل الشائعة

### المشكلة: "Firebase config missing keys"

**الحل**: تأكد من أن جميع متغيرات البيئة في ملف `.env` مُعرّفة وصحيحة.

### المشكلة: "Permission denied" عند محاولة الوصول لـ Firestore

**الحل**: تأكد من نشر قواعد Firestore:
```bash
firebase deploy --only firestore:rules
```

### المشكلة: لا يتم توجيهي للصفحة الصحيحة بعد تسجيل الدخول

**الحل**: تأكد من تعيين Custom Claims (الأدوار) للمستخدمين. يمكنك التحقق من ذلك عبر Firebase Console > Authentication > Users > انقر على المستخدم > يجب أن ترى Custom Claims.

### المشكلة: "Module not found" أو أخطاء TypeScript

**الحل**: أعد تثبيت المكتبات:
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

## البيئة والأمان

### للإنتاج

1. **تحديث قواعد Firestore**: راجع ملف `firestore.rules` لضمان الأمان
2. **تحديث قواعد Storage**: راجع ملف `storage.rules`
3. **استخدام HTTPS**: Firebase Hosting يوفر HTTPS تلقائياً
4. **إخفاء المفاتيح الحساسة**: لا ترفع ملف `.env` إلى Git

### للتطوير

- يمكنك استخدام Firebase Emulator Suite للاختبار المحلي:
```bash
firebase emulators:start
```

## الدعم والموارد

- **Firebase Documentation**: https://firebase.google.com/docs
- **React Documentation**: https://react.dev
- **Vite Documentation**: https://vitejs.dev

---

## الملاحظات الإضافية

### تحسينات مستقبلية مقترحة

1. **إضافة Dashboard للطلاب**: حالياً الصفحة بسيطة، يمكن تطويرها لعرض:
   - الصفوف المسجل فيها
   - الواجبات والاختبارات القادمة
   - الدرجات والأداء

2. **نظام الإشعارات**: إضافة Firebase Cloud Messaging للإشعارات

3. **تقارير متقدمة**: لوحات تحكم تحليلية للإدارة والمعلمين

4. **تطبيق جوال**: استخدام React Native أو Flutter

### هيكل البيانات في Firestore

راجع ملف `README.md` في المجلد الجذر للمشروع لفهم هيكل البيانات الكامل.
