// موحّد لشكل الرد عشان يطابق اللي التطبيق بيتوقعه بالظبط
// ملحوظة: الكلمة "massage" مكتوبة كده (بدل message) لأن كود الفلاتر
// بيقرأ response['massage'] بالظبط - لو غيرناها هنكسر التطبيق.
function sendResponse(res, { code = 200, massage = '', data = null }, httpStatus) {
  return res.status(httpStatus || (code === 200 ? 200 : 400)).json({
    code,
    massage,
    data,
  });
}

module.exports = { sendResponse };
