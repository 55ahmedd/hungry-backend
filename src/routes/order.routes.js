const express = require('express');
const jwt = require('jsonwebtoken');
const CartOrder = require('../models/CartOrder');
const Product = require('../models/Product');
const Topping = require('../models/Topping');
const SideOption = require('../models/SideOption');
const { requireAuth } = require('../middleware/auth');
const { sendResponse } = require('../utils/response');

const router = express.Router();

// نفس رسوم التوصيل والضريبة المستخدمة في التطبيق (Flutter) عشان
// الحسبة تطلع نفسها بالظبط لو حبينا نعتمد على رقم السيرفر بدل المحلي
const DELIVERY_FEE = 15;
const TAX_RATE = 0.05;

// بيحاول يقرا الـ userId من التوكن لو موجود وصحيح، من غير ما يرفض
// الطلب لو مفيش توكن (عشان الطلب كـ Guest يفضل شغال زي ما كان)
function tryGetUserId(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token || token === 'guest') return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch (_) {
    return null;
  }
}

// بيحوّل أوردر خام (product_id/toppings/side_options كأرقام بس) لشكل
// كامل فيه بيانات المنتجات والإضافات الحقيقية (اسم/صورة/سعر) - عشان
// التطبيق ميحتاجش يعمل مطابقة يدوية بنفسه
async function resolveOrder(order) {
  const productIds = [...new Set(order.items.map((i) => i.product_id))];
  const toppingIds = [...new Set(order.items.flatMap((i) => i.toppings || []))];
  const sideOptionIds = [...new Set(order.items.flatMap((i) => i.side_options || []))];

  const [products, toppings, sideOptions] = await Promise.all([
    Product.find({ id: { $in: productIds } }),
    Topping.find({ id: { $in: toppingIds } }),
    SideOption.find({ id: { $in: sideOptionIds } }),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const toppingMap = new Map(toppings.map((t) => [t.id, t]));
  const sideOptionMap = new Map(sideOptions.map((s) => [s.id, s]));

  let subtotal = 0;
  const items = order.items.map((item) => {
    const product = productMap.get(item.product_id);
    const itemToppings = (item.toppings || [])
      .map((id) => toppingMap.get(id))
      .filter(Boolean)
      .map((t) => t.toPublicJSON());
    const itemOptions = (item.side_options || [])
      .map((id) => sideOptionMap.get(id))
      .filter(Boolean)
      .map((o) => o.toPublicJSON());

    const unitPrice =
      (product ? product.price : 0) +
      itemToppings.reduce((s, t) => s + (t.price || 0), 0) +
      itemOptions.reduce((s, o) => s + (o.price || 0), 0);

    subtotal += unitPrice * item.quantity;

    return {
      product: product ? product.toPublicJSON() : { id: item.product_id, name: 'Unknown product', image: '', description: '', price: 0, rating: 0, category: '' },
      quantity: item.quantity,
      isSpicy: item.spicy === 1 || item.spicy === true,
      toppings: itemToppings,
      options: itemOptions,
    };
  });

  const deliveryFee = items.length ? DELIVERY_FEE : 0;
  const taxes = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + deliveryFee + taxes;

  return {
    id: order._id.toString(),
    status: order.status,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    items,
    subtotal,
    deliveryFee,
    taxes,
    total,
  };
}

// POST /api/orders  { items: [{product_id, quantity, spicy, toppings, side_options}], paymentMethod }
// ملحوظة: مسموح للـ guest كمان (التوكين مش لازم يكون صحيح) عشان الطلب يشتغل بدون تسجيل دخول لو حبيت
router.post('/', async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendResponse(res, { code: 422, massage: 'السلة فاضية', data: null });
    }

    const userId = tryGetUserId(req);
    const order = await CartOrder.create({
      user: userId,
      items,
      paymentMethod: paymentMethod || 'Cash on delivery',
    });

    const resolved = await resolveOrder(order);
    return sendResponse(res, { code: 200, massage: 'تم إنشاء الطلب بنجاح', data: resolved });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: null }, 500);
  }
});

// GET /api/orders - كل أوردرات المستخدم المسجل دخول، الأحدث الأول
router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await CartOrder.find({ user: req.userId }).sort({ createdAt: -1 });
    const resolved = await Promise.all(orders.map(resolveOrder));
    return sendResponse(res, { code: 200, massage: 'تم جلب الطلبات', data: resolved });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: [] }, 500);
  }
});

// GET /api/orders/:id - تفاصيل طلب واحد (لازم يكون بتاع نفس المستخدم)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await CartOrder.findOne({ _id: req.params.id, user: req.userId });
    if (!order) {
      return sendResponse(res, { code: 404, massage: 'الطلب غير موجود', data: null }, 404);
    }
    const resolved = await resolveOrder(order);
    return sendResponse(res, { code: 200, massage: 'تم جلب الطلب', data: resolved });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: null }, 500);
  }
});

// PATCH /api/orders/:id  { status: 'delivered' | 'cancelled' }
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'delivered', 'cancelled'].includes(status)) {
      return sendResponse(res, { code: 422, massage: 'حالة غير صحيحة', data: null });
    }
    const order = await CartOrder.findOne({ _id: req.params.id, user: req.userId });
    if (!order) {
      return sendResponse(res, { code: 404, massage: 'الطلب غير موجود', data: null }, 404);
    }
    order.status = status;
    await order.save();
    const resolved = await resolveOrder(order);
    return sendResponse(res, { code: 200, massage: 'تم تحديث حالة الطلب', data: resolved });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: null }, 500);
  }
});

// DELETE /api/orders/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const order = await CartOrder.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!order) {
      return sendResponse(res, { code: 404, massage: 'الطلب غير موجود', data: null }, 404);
    }
    return sendResponse(res, { code: 200, massage: 'تم حذف الطلب', data: null });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: null }, 500);
  }
});

module.exports = router;
