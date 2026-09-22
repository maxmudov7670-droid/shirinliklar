const express = require("express");
const prisma = require("../lib/prisma");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

// GET /api/products?all=true          -> admin: barchasi (nofaol ham)
// GET /api/products?categoryId=5      -> mini app: bitta kategoriya bo'yicha, faqat faol/mavjud
router.get(
  "/",
  async (req, res, next) => {
    if (req.query.all === "true") return requireAdminAuth(req, res, next);
    next();
  },
  async (req, res) => {
    try {
      const showAll = req.query.all === "true";
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const products = await prisma.product.findMany({
        where: {
          ...(showAll ? {} : { isAvailable: true }),
          ...(categoryId ? { categoryId } : {}),
        },
        include: { category: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      });
      res.json(products);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Mahsulotlarni olishda xatolik" });
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: "Mahsulot topilmadi" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Xatolik yuz berdi" });
  }
});

router.post("/", requireAdminAuth, async (req, res) => {
  try {
    const {
      categoryId, nameUz, nameRu, descriptionUz, descriptionRu,
      ingredientsUz, ingredientsRu, weight, price, oldPrice, imageUrl,
      isAvailable, sortOrder,
    } = req.body;

    if (!categoryId || !nameUz || !nameRu || !price) {
      return res.status(400).json({ error: "Kategoriya, nomi (uz/ru) va narxi majburiy" });
    }

    const product = await prisma.product.create({
      data: {
        categoryId: Number(categoryId),
        nameUz, nameRu,
        descriptionUz: descriptionUz || null,
        descriptionRu: descriptionRu || null,
        ingredientsUz: ingredientsUz || null,
        ingredientsRu: ingredientsRu || null,
        weight: weight || null,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        imageUrl: imageUrl || null,
        isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
        sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mahsulot qo'shishda xatolik" });
  }
});

router.put("/:id", requireAdminAuth, async (req, res) => {
  try {
    const body = req.body;
    const data = {};
    for (const key of [
      "nameUz", "nameRu", "descriptionUz", "descriptionRu",
      "ingredientsUz", "ingredientsRu", "weight", "imageUrl",
    ]) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    if (body.categoryId !== undefined) data.categoryId = Number(body.categoryId);
    if (body.price !== undefined) data.price = Number(body.price);
    if (body.oldPrice !== undefined) data.oldPrice = body.oldPrice === null ? null : Number(body.oldPrice);
    if (body.isAvailable !== undefined) data.isAvailable = Boolean(body.isAvailable);
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;

    const product = await prisma.product.update({ where: { id: Number(req.params.id) }, data });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mahsulotni yangilashda xatolik" });
  }
});

router.delete("/:id", requireAdminAuth, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Mahsulotni o'chirishda xatolik" });
  }
});

module.exports = router;
