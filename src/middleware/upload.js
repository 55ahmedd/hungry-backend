// 👈 قبل كده كان بيرفع الصور على الديسك المحلي لسيرفر الـ Node
// (multer.diskStorage)، وده بيتمسح على طول على Vercel لأن الديسك مؤقت
// (Ephemeral) بين كل Request والتاني - عشان كده صورة البروفايل كانت
// "بتترفع" (الطلب بينجح) بس بتختفي بعد كده. دلوقتي بترفع على Cloudinary
// (تخزين سحابي مجاني) فبتفضل موجودة فعليًا للأبد.
//
// خطوات التركيب (لازم قبل ما ترفع/تعمل Deploy):
// 1) اعمل حساب مجاني على https://cloudinary.com
// 2) من الـ Dashboard خد: Cloud Name / API Key / API Secret
// 3) ضيفهم في .env (محليًا) و Vercel (Project Settings → Environment
//    Variables) بنفس الأسماء دي:
//    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// 4) الباكدجات دي لازم تكون متضافة في package.json (اتضافت فعلاً):
//    cloudinary, multer-storage-cloudinary

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hungry-app/profile-images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
