// سكريبت لتعبئة قاعدة البيانات ببيانات تجريبية (منتجات، إضافات، خيارات جانبية)
// شغله بالأمر: npm run seed
//
// الصور دلوقتي صور حقيقية بعتهالي المستخدم، متخزنة في backend/public/images
// ومستضافة على نفس السيرفر بتاعك، فهتشتغل مع Image.network() في الفلاتر عادي
// من غير أي اعتماد على مواقع خارجية.
//
// ملحوظة: الأسماء والأوصاف بالإنجليزي عشان مشكلة عدم دعم الخط للعربي في تطبيق الفلاتر.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const Topping = require('./models/Topping');
const SideOption = require('./models/SideOption');

const BASE = process.env.PUBLIC_BASE_URL || 'http://localhost:5000';
if (!process.env.PUBLIC_BASE_URL) {
  console.warn('⚠️  PUBLIC_BASE_URL مش متحطوطة في .env، هستخدم http://localhost:5000 مؤقتًا.');
  console.warn('   لو التطبيق شغال على موبايل حقيقي أو على Render، الصور مش هتظهر إلا لو حطيت رابط سيرفرك الصح.');
}
const img = (file) => `${BASE}/images/${file}`;

const products = [
  { id: 1, name: 'Classic Cheese Burger', image: img('classic-cheese-burger.jpg'), description: 'Beef patty with cheddar cheese, lettuce, tomato and onion', price: 120, rating: 4.5, category: 'burger' },
  { id: 2, name: 'Bacon Double Cheeseburger', image: img('bacon-double-cheeseburger.jpg'), description: 'Double beef patty with crispy bacon, cheese, pickles and onion', price: 165, rating: 4.7, category: 'burger' },
  { id: 3, name: 'Spicy Crispy Chicken Burger', image: img('spicy-crispy-chicken-burger.jpg'), description: 'Crispy fried chicken with spicy sauce, pickles and onion', price: 110, rating: 4.4, category: 'burger' },
  { id: 4, name: 'Crispy Chicken Burger', image: img('crispy-chicken-burger.jpg'), description: 'Crispy chicken fillet with cheese, lettuce and tomato', price: 100, rating: 4.3, category: 'burger' },
  { id: 5, name: 'BBQ Bacon Chicken Burger', image: img('bbq-bacon-chicken-burger.jpg'), description: 'Crispy chicken with BBQ sauce, cheese and crispy bacon', price: 135, rating: 4.6, category: 'burger' },
  { id: 6, name: 'Philly Cheesesteak', image: img('philly-cheesesteak.jpg'), description: 'Shaved beef steak with melted cheese and grilled onions', price: 140, rating: 4.5, category: 'sandwich' },
  { id: 7, name: 'Steak & Pepper Sandwich', image: img('steak-pepper-sandwich.jpg'), description: 'Grilled steak with peppers, onions and melted cheese', price: 130, rating: 4.4, category: 'sandwich' },
  { id: 8, name: 'Grilled Chicken Panini', image: img('grilled-chicken-panini.jpg'), description: 'Grilled chicken with peppers, tomato and special sauce', price: 115, rating: 4.5, category: 'sandwich' },
  { id: 9, name: 'Quattro Formaggi Pizza', image: img('quattro-pizza.jpg'), description: 'Pepperoni pizza with olives, cherry tomatoes and basil', price: 145, rating: 4.6, category: 'pizza' },
  { id: 10, name: 'Margherita Pizza', image: img('margherita-pizza.jpg'), description: 'Classic Italian pizza with mozzarella, cherry tomatoes and basil', price: 100, rating: 4.4, category: 'pizza' },
  { id: 11, name: 'Loaded Chili Cheese Fries', image: img('loaded-chili-cheese-fries.jpg'), description: 'Crispy fries loaded with chili, beans, cheese sauce and bacon', price: 85, rating: 4.5, category: 'sides' },
];

const toppings = [
  { id: 1, name: 'Cheddar Cheese', image: img('cheddar-cheese.png'), price: 8 },
  { id: 2, name: 'Bacon', image: img('bacon-topping.png'), price: 15 },
  { id: 3, name: 'Lettuce', image: img('lettuce-topping.png'), price: 3 },
  { id: 4, name: 'Tomato', image: img('tomato-topping.png'), price: 5 },
  { id: 5, name: 'Onion Rings', image: img('onion-rings-topping.png'), price: 8 },
  { id: 6, name: 'Pickles', image: img('pickles-topping.png'), price: 5 },
];

const sideOptions = [
  { id: 1, name: 'French Fries', image: img('french-fries-side.png'), price: 25 },
  { id: 2, name: 'Onion Rings', image: img('onion-rings-side.png'), price: 28 },
  { id: 3, name: 'Coleslaw', image: img('coleslaw-side.png'), price: 20 },
  { id: 4, name: 'Soft Drink', image: img('soft-drink-side.png'), price: 18 },
];

async function seed() {
  await connectDB();

  await Product.deleteMany({});
  await Topping.deleteMany({});
  await SideOption.deleteMany({});

  await Product.insertMany(products);
  await Topping.insertMany(toppings);
  await SideOption.insertMany(sideOptions);

  console.log('✅ تم تعبئة قاعدة البيانات بنجاح. الصور من:', BASE);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ فشل في التعبئة:', err);
  process.exit(1);
});
