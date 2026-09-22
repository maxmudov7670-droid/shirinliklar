const express = require("express");
const prisma = require("../lib/prisma");
const { requireTelegramAuth } = require("../middleware/telegramAuth");

const router = express.Router();

// POST /api/users/sync — Mini App ochilganda chaqiriladi
router.post("/sync", requireTelegramAuth, async (req, res) => {
  try {
    const tgUser = req.telegramUser;
    const telegramId = String(tgUser.id);
    const { languageCode } = req.body;

    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {
        firstName: tgUser.first_name || null,
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        ...(languageCode && { languageCode }),
      },
      create: {
        telegramId,
        firstName: tgUser.first_name || null,
        lastName: tgUser.last_name || null,
        username: tgUser.username || null,
        languageCode: languageCode || "uz",
      },
    });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Foydalanuvchini sinxronlashda xatolik" });
  }
});

// PUT /api/users/phone — telefon raqamini saqlash (Telegram "contact" tugmasi orqali)
router.put("/phone", requireTelegramAuth, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Telefon raqami kerak" });
    const user = await prisma.user.update({
      where: { telegramId: String(req.telegramUser.id) },
      data: { phone },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Telefonni saqlashda xatolik" });
  }
});

// --- Sevimlilar ---

router.get("/favorites", requireTelegramAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { telegramId: String(req.telegramUser.id) } });
    if (!user) return res.json([]);
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(favorites.map((f) => f.product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sevimlilarni olishda xatolik" });
  }
});

router.post("/favorites/:productId", requireTelegramAuth, async (req, res) => {
  try {
    const user = await prisma.user.upsert({
      where: { telegramId: String(req.telegramUser.id) },
      update: {},
      create: { telegramId: String(req.telegramUser.id) },
    });
    await prisma.favorite.upsert({
      where: { userId_productId: { userId: user.id, productId: Number(req.params.productId) } },
      update: {},
      create: { userId: user.id, productId: Number(req.params.productId) },
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sevimlilarga qo'shishda xatolik" });
  }
});

router.delete("/favorites/:productId", requireTelegramAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { telegramId: String(req.telegramUser.id) } });
    if (user) {
      await prisma.favorite.deleteMany({
        where: { userId: user.id, productId: Number(req.params.productId) },
      });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sevimlilardan o'chirishda xatolik" });
  }
});

// --- Saqlangan manzillar ---

router.get("/addresses", requireTelegramAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { telegramId: String(req.telegramUser.id) } });
    if (!user) return res.json([]);
    const addresses = await prisma.savedAddress.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(addresses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Manzillarni olishda xatolik" });
  }
});

router.post("/addresses", requireTelegramAuth, async (req, res) => {
  try {
    const { label, address, location } = req.body;
    if (!address) return res.status(400).json({ error: "Manzil matni kerak" });
    const user = await prisma.user.upsert({
      where: { telegramId: String(req.telegramUser.id) },
      update: {},
      create: { telegramId: String(req.telegramUser.id) },
    });
    const saved = await prisma.savedAddress.create({
      data: { userId: user.id, label: label || null, address, location: location || null },
    });
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Manzilni saqlashda xatolik" });
  }
});

router.delete("/addresses/:id", requireTelegramAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { telegramId: String(req.telegramUser.id) } });
    if (user) {
      await prisma.savedAddress.deleteMany({ where: { id: Number(req.params.id), userId: user.id } });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Manzilni o'chirishda xatolik" });
  }
});

module.exports = router;
