const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // hashed
    image: { type: String, default: '' },
    address: { type: String, default: '' },
    visa: { type: String, default: '' }, // stored lowercase, exposed as "Visa" in JSON to match the app
  },
  { timestamps: true }
);

// شكل الرد اللي هيتبعت للفلاتر: name, email, image, token, address, Visa
userSchema.methods.toPublicJSON = function (token = '') {
  return {
    name: this.name,
    email: this.email,
    image: this.image || '',
    token: token || '',
    address: this.address || '',
    Visa: this.visa || '',
  };
};

module.exports = mongoose.model('User', userSchema);
