const express = require("express");
const prisma = require("../lib/prisma");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

// GET /api/categories            -> Mini App: faqat faol kategoriyalar
// GET /api/categories?all=true   -> Admin Panel: hammasi
router.get(
  "/",
  async (req, res, next) => {
    if (req.query.all === "true") return requireAdminAuth(req, res, next);
    next();
  },
  async (req, res) => {
    try {
      const showAll = req.query.all === "true";
      const categories = await prisma.category.findMany({
        where: showAll ? {} : { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      });
      res.json(categories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Kategoriyalarni olishda xatolik" });
    }
  }
);

router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const { emoji, nameUz, nameRu, sortOrder, isActive } = req.body;
    if (!emoji || !nameUz || !nameRu) {
      return res.status(400).json({ error: "Emoji va ikkala tildagi nomi majburiy" });
    }
    const category = await prisma.category.create({
      data: {
        emoji,
        nameUz,
        nameRu,
        sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kategoriya qo'shishda xatolik" });
  }
});

router.put("/:id", requireAdminAuth, async (req, res) => {
  try {
    const { emoji, nameUz, nameRu, sortOrder, isActive } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(emoji !== undefined && { emoji }),
        ...(nameUz !== undefined && { nameUz }),
        ...(nameRu !== undefined && { nameRu }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) || 0 }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kategoriyani yangilashda xatolik" });
  }
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  try {
    const inUse = await prisma.product.count({ where: { categoryId: Number(req.params.id) } });
    if (inUse > 0) {
      return res.status(400).json({
        error: "Bu kategoriyada mahsulotlar bor — avval ularni boshqa kategoriyaga o'tkazing yoki o'chiring",
      });
    }
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Kategoriyani o'chirishda xatolik" });
  }
});

module.exports = router;
