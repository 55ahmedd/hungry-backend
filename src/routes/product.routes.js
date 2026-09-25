const express = require('express');
const Product = require('../models/Product');
const Topping = require('../models/Topping');
const SideOption = require('../models/SideOption');
const { sendResponse } = require('../utils/response');

const router = express.Router();

// GET /api/products/  (لاحظ الـ / في الآخر زي ما التطبيق بيطلبها)
// router.get('/products/', async (req, res) => {
  // خليه كده:
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    return sendResponse(res, {
      code: 200,
      massage: 'تم جلب المنتجات',
      data: products.map((p) => p.toPublicJSON()),
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: [] }, 500);
  }
});

// GET /api/toppings
router.get('/toppings', async (req, res) => {
  try {
    const toppings = await Topping.find().sort({ id: 1 });
    return sendResponse(res, {
      code: 200,
      massage: 'تم جلب الإضافات',
      data: toppings.map((t) => t.toPublicJSON()),
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: [] }, 500);
  }
});

// GET /api/side-options
router.get('/side-options', async (req, res) => {
  try {
    const options = await SideOption.find().sort({ id: 1 });
    return sendResponse(res, {
      code: 200,
      massage: 'تم جلب الخيارات الجانبية',
      data: options.map((o) => o.toPublicJSON()),
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, { code: 500, massage: 'حصل خطأ في السيرفر', data: [] }, 500);
  }
});

module.exports = router;
