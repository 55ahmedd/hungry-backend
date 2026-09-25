const mongoose = require('mongoose');

// side-options وtoppings عندهم نفس الشكل بالظبط في التطبيق (ToppingModel)
const sideOptionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  // 👈 جديد: سعر الإضافة - بيتجمع مع سعر المنتج الأساسي وقت الطلب
  price: { type: Number, default: 0 },
});

sideOptionSchema.methods.toPublicJSON = function () {
  return { id: this.id, name: this.name, image: this.image, price: this.price };
};

module.exports = mongoose.model('SideOption', sideOptionSchema);
