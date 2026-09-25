# Hungry Backend (مجاني 100%)

باك ايند Node.js + Express + MongoDB جاهز يشتغل مع تطبيق الفلاتر بتاعك بدون أي تعديل في الـ endpoints
(login, register, profile, update-profile, logout, products, toppings, side-options, cart/add).

ليه MongoDB Atlas مش Render Postgres؟ لأن الـ Free Postgres في Render بيتقفل تلقائيًا بعد 90 يوم،
أما MongoDB Atlas Free Tier (M0) فمجاني للأبد وبياناتك متخزنة عنده مش على سيرفر الـ Render نفسه،
يعني حتى لو السيرفر "نام" أو اتعمله Redeploy، بياناتك مش هتضيع.

---

## 1) اعمل قاعدة بيانات مجانية على MongoDB Atlas

1. روح على https://www.mongodb.com/cloud/atlas/register وسجل حساب مجاني.
2. لما يطلب منك تعمل Cluster، اختار **M0 Free**.
3. اختار أي Provider/Region قريب منك (AWS - Frankfurt مثلاً) واضغط Create.
4. من قسم **Database Access**: اعمل مستخدم جديد (Username + Password) واحفظهم.
5. من قسم **Network Access**: اضغط Add IP Address واختار **Allow Access From Anywhere** (0.0.0.0/0)
   عشان Render يقدر يوصل للداتا بيز.
6. من صفحة الـ Cluster اضغط **Connect** → **Drivers** وانسخ الـ Connection String، هيكون شكله كده:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. غيّر `<username>` و `<password>` بالبيانات اللي عملتها، وضيف اسم قاعدة البيانات بعد `.net/` كده:
   ```
   mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/hungry?retryWrites=true&w=majority
   ```

احتفظ بالرابط ده، هتحتاجه في الخطوة الجاية.

---

## 2) ارفع الكود على GitHub

1. اعمل repo جديد فاضي على GitHub.
2. من جوه فولدر `backend` (اللي فيه الملف ده):
   ```bash
   git init
   git add .
   git commit -m "Initial backend"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo-name>.git
   git push -u origin main
   ```

---

## 3) اعمل ديبلوي مجاني على Render

1. روح على https://render.com وسجل دخول (ممكن بحساب GitHub بتاعك مباشرة).
2. اضغط **New +** → **Web Service**.
3. اختار الـ Repo اللي رفعته.
4. في الإعدادات:
   - **Name**: أي اسم تحبه، مثلاً `hungry-backend`
   - **Region**: أقرب منطقة ليك
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
5. في قسم **Environment Variables** ضيف:
   - `MONGO_URI` = الرابط اللي نسخته من Atlas
   - `JWT_SECRET` = أي نص عشوائي طويل (مثلاً استخدم موقع مولّد باسورد)
   - `PORT` = `5000` (اختياري، Render بيحددها تلقائي برضو)
6. اضغط **Create Web Service** واستنى الـ Build يخلص (بياخد دقيقتين تقريبًا).
7. لما يخلص، هتلاقي رابط زي:
   ```
   https://hungry-backend-xxxx.onrender.com
   ```

---

## 4) عبّي البيانات التجريبية (منتجات، إضافات، خيارات جانبية)

من جهازك (بعد ما تحط MONGO_URI في ملف `.env` محلي):
```bash
npm install
npm run seed
```
ده هيحط منتجات وtoppings وside-options تجريبية في نفس قاعدة البيانات اللي هيقراها Render.
تقدر تعدل البيانات دي من ملف `src/seed.js` وتحط منتجاتك وصورك الحقيقية.

---

## 5) اربط تطبيق الفلاتر بالباك ايند الجديد

في ملف:
```
lib/core/network/dio_client .dart
```
غيّر السطر ده:
```dart
baseUrl: 'https://sonic-zdi0.onrender.com/api',
```
إلى رابطك الجديد:
```dart
baseUrl: 'https://hungry-backend-xxxx.onrender.com/api',
```

كده تطبيقك بقى شغال على باك ايند بتاعك انت بالكامل، مجاني، وميعادش يتقفل.

---

## ملاحظات مهمة

- **السيرفر بينام بعد 15 دقيقة من عدم الاستخدام** (طبيعة الخطة المجانية في Render)، وأول طلب بعد النوم بياخد
  20-30 ثانية لحد ما "يصحى". ده طبيعي ومش خطأ.
- **صور البروفايل** بتتخزن حاليًا على قرص Render نفسه (`src/uploads`)؛ الميزة إن ده شغال فورًا بدون تعقيد،
  لكن العيب إنها ممكن تتمسح لو عملت Redeploy جديد. لو عايز حل دائم للصور، قولي وأعملك ربط بـ
  Cloudinary (مجاني برضو) بدل التخزين المحلي.
- شكل الرد من كل الـ endpoints هو بالظبط:
  ```json
  { "code": 200, "massage": "...", "data": { ... } }
  ```
  (الكلمة "massage" مقصودة ومطابقة لكود الفلاتر بتاعك، متغيرهاش).

---

## تشغيل محلي للتجربة

```bash
npm install
cp .env.example .env   # واملأ القيم
npm run dev
```
هيشتغل على `http://localhost:5000/api`.
