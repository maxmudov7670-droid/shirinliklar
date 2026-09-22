// Mahsulot rasmi va maxsus tort namuna rasmini yuklash uchun ImgBB
// (bepul, karta/biznes tasdiqlash talab qilmaydi).
function isImgbbConfigured() {
  return Boolean(process.env.IMGBB_API_KEY);
}

module.exports = { isImgbbConfigured };
