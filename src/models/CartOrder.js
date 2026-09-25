const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    product_id: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    spicy: { type: Number, default: 0 },
    toppings: { type: [Number], default: [] },
    side_options: { type: [Number], default: [] },
  },
  { _id: false }
);

const cartOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // ممكن يكون Guest
    items: { type: [itemSchema], default: [] },
    // 👈 القيم بقت مطابقة تمامًا لحالات الأوردر في التطبيق (Flutter):
    // active (لسه شغالين عليه) / delivered (خلص) / cancelled (اتلغى)
    status: { type: String, enum: ['active', 'delivered', 'cancelled'], default: 'active' },
    // 👈 جديد: وسيلة الدفع، بتتبعت من التطبيق وقت تأكيد الطلب
    paymentMethod: { type: String, default: 'Cash on delivery' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CartOrder', cartOrderSchema);
