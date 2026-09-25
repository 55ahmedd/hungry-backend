const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/response');

// middleware بيتحقق من الـ Bearer token
// لو مفيش توكن أو غلط، بيرجع نفس شكل الرد المتفق عليه {code, massage, data}
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token === 'guest') {
    return sendResponse(res, { code: 401, massage: 'من فضلك سجل دخول أولاً', data: null }, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return sendResponse(res, { code: 401, massage: 'الجلسة غير صالحة، سجل دخول تاني', data: null }, 401);
  }
}

module.exports = { requireAuth };
