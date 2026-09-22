const express = require("express");
const prisma = require("../lib/prisma");
const { requireAdminAuth } = require("../middleware/adminAuth");
const { requireTelegramAuth } = require("../middleware/telegramAuth");

const router = express.Router();

// POST /api/promocodes/check — Mini App: mijoz kodni kiritganda summani hisoblab beradi
router.post("/check", requireTelegramAuth, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ error: "Promo kod kiriting" });

    const promo = await prisma.promoCode.findUnique({ where: { code: String(code).trim().toUpperCase() } });
    if (!promo || !promo.isActive) {
      return res.status(404).json({ error: "Promo kod topilmadi yoki faol emas" });
    }
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ error: "Promo kodning amal qilish muddati tugagan" });
    }
    if (Number(subtotal) < promo.minOrderAmount) {
      return res.status(400).json({
        error: `Bu kod uchun buyurtma kamida ${promo.minOrderAmount.toLocaleString("uz-UZ")} so'm bo'lishi kerak`,
      });
    }

    let discount = 0;
    if (promo.percentOff) discount = Math.round((Number(subtotal) * promo.percentOff) / 100);
    if (promo.amountOff) discount = Math.max(discount, promo.amountOff);
    discount = Math.min(discount, Number(subtotal));

    res.json({ id: promo.id, code: promo.code, discount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Promo kodni tekshirishda xatolik" });
  }
});

// --- Admin Panel: promo kodlarni boshqarish ---

router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const promoCodes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
    res.json(promoCodes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Promo kodlarni olishda xatolik" });
  }
});

router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const { code, percentOff, amountOff, minOrderAmount, expiresAt, isActive } = req.body;
    if (!code || (!percentOff && !amountOff)) {
      return res.status(400).json({ error: "Kod va (foizli yoki summaviy) chegirma kerak" });
    }
    const promo = await prisma.promoCode.create({
      data: {
        code: String(code).trim().toUpperCase(),
        percentOff: percentOff ? Number(percentOff) : null,
        amountOff: amountOff ? Number(amountOff) : null,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });
    res.status(201).json(promo);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Bu kod allaqachon mavjud" });
    }
    console.error(err);
    res.status(500).json({ error: "Promo kod qo'shishda xatolik" });
  }
});

router.put("/:id", requireAdminAuth, async (req, res) => {
  try {
    const { percentOff, amountOff, minOrderAmount, expiresAt, isActive } = req.body;
    const promo = await prisma.promoCode.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(percentOff !== undefined && { percentOff: percentOff ? Number(percentOff) : null }),
        ...(amountOff !== undefined && { amountOff: amountOff ? Number(amountOff) : null }),
        ...(minOrderAmount !== undefined && { minOrderAmount: Number(minOrderAmount) || 0 }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });
    res.json(promo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Promo kodni yangilashda xatolik" });
  }
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  try {
    await prisma.promoCode.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Promo kodni o'chirishda xatolik" });
  }
});

module.exports = router;
