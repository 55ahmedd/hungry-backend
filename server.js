require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');
const orderRoutes = require('./src/routes/order.routes');

const app = express();

// اتصال بقاعدة البيانات
connectDB();

app.use(cors()); // يسمح للفلاتر ويب / موبايل يوصل من أي دومين
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// السماح بعرض الصور المرفوعة (صور البروفايل)
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads')));

// صور المنتجات/الإضافات الثابتة (خلفية بيضاء، مستضافة على نفس السيرفر)
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// صفحة تأكيد إن السيرفر شغال (مفيدة عشان تتأكد من المتصفح)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Hungry backend is running 🚀' });
});
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Hungry API root' });
});

// app.use('/api', authRoutes);
// app.use('/api', productRoutes);
// app.use('/api', cartRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
// 👈 قبل كده كان /api/cart وبيه مشكلة تكرار مسار (/api/cart/cart/add)،
// دلوقتي بقى مورد كامل (Orders) فيه إنشاء/عرض/تحديث/حذف الطلبات
app.use('/api/orders', orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ code: 404, massage: 'المسار غير موجود', data: null });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
module.exports = app;
