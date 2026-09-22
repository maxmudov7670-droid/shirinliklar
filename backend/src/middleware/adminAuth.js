// Shirinliklar Admin Panel — ALOHIDA ADMIN_PASSWORD bilan himoyalanadi
// (mavjud ovqat botining admin paroli bilan bog'liq emas).
function requireAdminAuth(req, res, next) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return res.status(503).json({ error: "Admin panel hali sozlanmagan (ADMIN_PASSWORD yo'q)" });
  }

  const provided = req.header("x-admin-password");
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: "Noto'g'ri parol" });
  }

  next();
}

module.exports = { requireAdminAuth };
