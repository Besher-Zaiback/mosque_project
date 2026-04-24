# Quran Circles Platform

منصة تنظيم حلقات حفظ القرآن الكريم في الجوامع، مبنية على:

- `frontend`: React + TypeScript + Vite
- `backend`: NestJS + TypeScript + TypeORM
- قاعدة البيانات: PostgreSQL

## الأدوار المدعومة

- مشرف الحلقة: يشاهد طلاب حلقته فقط ويقيّم الصفحات.
- مدير الجامع: يدير الطلاب في الحلقات ويطلب اختبارًا من المدير العام.
- المدير العام: يعتمد نتيجة الاختبار من 100 ويقرر النجاح/البقاء.
- ولي الأمر: يتابع ابنه فقط وتقييمات حفظه.

## تشغيل المشروع عبر Docker

شغّل المشروع بالكامل من جذر المشروع:

```bash
docker compose up --build
```

الواجهة: `http://localhost:5173`  
الـ API: `http://localhost:3000`  
قاعدة البيانات PostgreSQL: `localhost:5432`

للتشغيل في الخلفية:

```bash
docker compose up --build -d
```

لإيقاف الحاويات:

```bash
docker compose down
```

ولحذف بيانات قاعدة البيانات أيضًا:

```bash
docker compose down -v
```

يمكن تغيير سر JWT أو عنوان الـ API وقت البناء عبر ملف `.env` في جذر المشروع:

```bash
JWT_SECRET=change_this_secret
VITE_API_BASE_URL=http://localhost:3000
```

## تشغيل المشروع محليًا بدون Docker

1) شغّل PostgreSQL:

```bash
docker compose up -d
```

2) تشغيل الباك اند:

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

3) تشغيل الفرونت اند:

```bash
cd frontend
npm install
npm run dev
```

الواجهة: `http://localhost:5173`  
الـ API: `http://localhost:3000`

## حسابات تجريبية

كل الحسابات بكلمة المرور: `123456`

- `supervisor@example.com`
- `manager@example.com`
- `general@example.com`
- `parent@example.com`

## رفع المشروع إلى GitHub

نفّذ من جذر المشروع:

```bash
git init
git add .
git commit -m "Initial Quran circles platform MVP"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```
