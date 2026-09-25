const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // رقم صحيح زي ما التطبيق محتاج بالظبط
  name: { type: String, required: true },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  category: { type: String, default: 'burger' },
});

productSchema.methods.toPublicJSON = function () {
  return {
    id: this.id,
    name: this.name,
    image: this.image,
    description: this.description,
    price: this.price,
    rating: this.rating,
    category: this.category, // 👈 كان ناقص هنا؛ موجود في الـ Schema بس متبعتش للتطبيق
  };
};

module.exports = mongoose.model('Product', productSchema);
