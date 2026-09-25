const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return sendResponse(res, { code: 422, massage: 'من فضلك ادخل الاسم والايميل والباسورد', data: null });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendResponse(res, { code: 409, massage: 'الايميل ده مسجل بالفعل', data: null });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase().trim(), password: hashed });
    const token = generateToken(user._id);

    return sendResponse(res, { code: 200, massage: 'تم التسجيل بنجاح', data: user.toPublicJSON(token) });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: null }, 500);
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendResponse(res, { code: 422, massage: 'من فضلك ادخل الايميل والباسورد', data: null });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendResponse(res, { code: 401, massage: 'الايميل أو الباسورد غلط', data: null });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, { code: 401, massage: 'الايميل أو الباسورد غلط', data: null });
    }

    const token = generateToken(user._id);
    return sendResponse(res, { code: 200, massage: 'تم تسجيل الدخول بنجاح', data: user.toPublicJSON(token) });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: null }, 500);
  }
});

// GET /api/profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return sendResponse(res, { code: 404, massage: 'المستخدم غير موجود', data: null }, 404);
    }
    return sendResponse(res, { code: 200, massage: 'تم', data: user.toPublicJSON() });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: null }, 500);
  }
});

// POST /api/update-profile (multipart/form-data: name, email, address, Visa, image)
router.post('/update-profile', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return sendResponse(res, { code: 404, massage: 'المستخدم غير موجود', data: null }, 404);
    }

    const { name, email, address, Visa, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    if (address) user.address = address;
    if (Visa) user.visa = Visa;
    // 👈 جديد: تغيير الباسورد لو المستخدم بعت واحد جديد (بيتعمله Hash
    // زي بالظبط ما بيحصل وقت التسجيل)
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (req.file) {
      // 👈 CloudinaryStorage بيحط رابط الصورة الكامل والدائم في req.file.path
      // مباشرة (بدل ما كنا بنركب رابط لملف محلي هيتمسح)
      user.image = req.file.path;
    }

    await user.save();
    return sendResponse(res, { code: 200, massage: 'تم تحديث البيانات بنجاح', data: user.toPublicJSON() });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: null }, 500);
  }
});

// POST /api/logout
router.post('/logout', requireAuth, async (req, res) => {
  // ملحوظة مهمة: كود الفلاتر بيتحقق "if(response['data'] != null) throw Error"
  // يعني لازم نرجع data: null بالظبط عشان اللوج آوت ينجح من غير error في التطبيق
  return sendResponse(res, { code: 200, massage: 'تم تسجيل الخروج', data: null });
});

module.exports = router;
