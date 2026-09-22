const express = require("express");
const prisma = require("../lib/prisma");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

// Sozlamalar doim bitta qatorda (id=1) saqlanadi — hali mavjud bo'lmasa
// avtomatik yaratiladi.
async function getSettings() {
  let s = await prisma.settings.findUnique({ where: { id: 1 } });
  if (!s) {
    s = await prisma.settings.create({ data: { id: 1 } });
  }
  return s;
}

// GET /api/settings — ochiq: bot va Mini App shu orqali logoni olib turadi
router.get("/", async (req, res) => {
  try {
    const s = await getSettings();
    res.json({ startImage: s.startImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sozlamalarni olishda xatolik" });
  }
});

// PUT /api/settings — faqat admin
router.put("/", requireAdminAuth, async (req, res) => {
  try {
    const { startImage } = req.body;
    await getSettings();
    const s = await prisma.settings.update({
      where: { id: 1 },
      data: { ...(startImage !== undefined && { startImage: startImage || null }) },
    });
    res.json({ startImage: s.startImage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sozlamalarni yangilashda xatolik" });
  }
});

module.exports = router;
