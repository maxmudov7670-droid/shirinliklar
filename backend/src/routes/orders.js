const express = require("express");
const prisma = require("../lib/prisma");
const { requireTelegramAuth } = require("../middleware/telegramAuth");
const { requireAdminAuth } = require("../middleware/adminAuth");
const {
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  statusLabel,
  statusMessage,
} = require("../lib/orderStatus");
const { buildPaymentUrl, isClickConfigured, isPaymeConfigured } = require("../lib/paymentLinks");
const { notifyOrderStatusChange, notifyStaffNewOrder, notifyStaffCustomCake } = require("../bot/bot");

const router = express.Router();

const VALID_PAYMENT_METHODS = ["cash", "click", "payme"];
const VALID_STATUSES = Object.keys(STATUS_LABELS);
const DELIVERY_PRICE = Number(process.env.DELIVERY_PRICE || 0);

function serializeOrder(order) {
  return {
    id: order.id,
    status: order.status,
    statusLabelUz: statusLabel(order.status, "uz"),
    statusLabelRu: statusLabel(order.status, "ru"),
    isCustomCake: order.isCustomCake,
    items: order.items,
    cake: order.isCustomCake
      ? {
          type: order.cakeType,
          size: order.cakeSize,
          flavor: order.cakeFlavor,
          design: order.cakeDesign,
          text: order.cakeText,
          note: order.cakeNote,
          imageUrl: order.cakeImageUrl,
          price: order.cakePrice,
        }
      : null,
    subtotal: order.subtotal,
    deliveryPrice: order.deliveryPrice,
    discount: order.discount,
    totalPrice: order.totalPrice,
    deliveryAddress: order.deliveryAddress,
    deliveryLocation: order.deliveryLocation,
    deliveryDate: order.deliveryDate,
    deliveryTime: order.deliveryTime,
    phone: order.phone,
    note: order.note,
    paymentMethod: order.paymentMethod,
    paymentMethodLabelUz: PAYMENT_METHOD_LABELS[order.paymentMethod]?.uz || order.paymentMethod,
    paymentMethodLabelRu: PAYMENT_METHOD_LABELS[order.paymentMethod]?.ru || order.paymentMethod,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    customerName: [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ") || "Noma'lum",
    customerPhone: order.user?.phone || order.phone || "-",
    customerUsername: order.user?.username,
  };
}

// GET /api/orders  (Admin Panel: barcha buyurtmalar, ixtiyoriy ?status= filtri)
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const orders = await prisma.order.findMany({
      where: status ? { status } : {},
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders.map(serializeOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Buyurtmalarni olishda xatolik" });
  }
});

// PATCH /api/orders/:id/status  (Admin Panel: holatni o'zgartirish)
router.patch("/:id/status", requireAdminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Noto'g'ri holat qiymati" });
    }
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: { user: true },
    });
    res.json(serializeOrder(order));
    notifyOrderStatusChange(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Holatni yangilashda xatolik" });
  }
});

// PATCH /api/orders/:id/cake-price  (Admin Panel: maxsus tortga narx belgilash)
router.patch("/:id/cake-price", requireAdminAuth, async (req, res) => {
  try {
    const { cakePrice } = req.body;
    if (!cakePrice || Number(cakePrice) <= 0) {
      return res.status(400).json({ error: "To'g'ri narx kiriting" });
    }
    const existing = await prisma.order.findUnique({ where: { id: Number(req.params.id) } });
    if (!existing || !existing.isCustomCake) {
      return res.status(400).json({ error: "Bu maxsus tort buyurtmasi emas" });
    }
    const newSubtotal = Number(cakePrice);
    const newTotal = newSubtotal + existing.deliveryPrice - existing.discount;
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { cakePrice: newSubtotal, subtotal: newSubtotal, totalPrice: newTotal },
      include: { user: true },
    });
    res.json(serializeOrder(order));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Narxni belgilashda xatolik" });
  }
});

// GET /api/orders/user/:telegramId  (Mini App: "Buyurtmalarim")
router.get("/user/:telegramId", requireTelegramAuth, async (req, res) => {
  try {
    if (String(req.telegramUser.id) !== String(req.params.telegramId)) {
      return res.status(403).json({ error: "Ruxsat berilmagan" });
    }
    const user = await prisma.user.findUnique({ where: { telegramId: String(req.params.telegramId) } });
    if (!user) return res.json([]);
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders.map(serializeOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Buyurtmalar tarixini olishda xatolik" });
  }
});

async function resolvePromo(promoCode, subtotal) {
  if (!promoCode) return { discount: 0, promoCodeId: null };
  const promo = await prisma.promoCode.findUnique({ where: { code: String(promoCode).trim().toUpperCase() } });
  if (!promo || !promo.isActive) return { discount: 0, promoCodeId: null };
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return { discount: 0, promoCodeId: null };
  if (subtotal < promo.minOrderAmount) return { discount: 0, promoCodeId: null };
  let discount = 0;
  if (promo.percentOff) discount = Math.round((subtotal * promo.percentOff) / 100);
  if (promo.amountOff) discount = Math.max(discount, promo.amountOff);
  discount = Math.min(discount, subtotal);
  return { discount, promoCodeId: promo.id };
}

async function upsertUser(tgUser, phone) {
  return prisma.user.upsert({
    where: { telegramId: String(tgUser.id) },
    update: {
      firstName: tgUser.first_name || null,
      lastName: tgUser.last_name || null,
      username: tgUser.username || null,
      ...(phone && { phone }),
    },
    create: {
      telegramId: String(tgUser.id),
      firstName: tgUser.first_name || null,
      lastName: tgUser.last_name || null,
      username: tgUser.username || null,
      phone: phone || null,
    },
  });
}

// POST /api/orders  (Mini App: oddiy mahsulot buyurtmasi)
router.post("/", requireTelegramAuth, async (req, res) => {
  try {
    const { items, deliveryAddress, deliveryLocation, deliveryDate, deliveryTime, note, phone, paymentMethod, promoCode } = req.body;
    const tgUser = req.telegramUser;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Savatcha bo'sh" });
    }

    const method = VALID_PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : "cash";
    if (method === "click" && !isClickConfigured()) {
      return res.status(400).json({ error: "Click orqali to'lov hali faollashtirilmagan" });
    }
    if (method === "payme" && !isPaymeConfigured()) {
      return res.status(400).json({ error: "Payme orqali to'lov hali faollashtirilmagan" });
    }

    const user = await upsertUser(tgUser, phone);

    // XAVFSIZLIK: narxlarni mijozdan emas, bazadan o'zimiz hisoblaymiz.
    const productIds = items.map((i) => Number(i.productId));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = productMap.get(Number(item.productId));
      if (!product || !product.isAvailable) continue;
      const qty = Math.max(1, Math.min(99, Number(item.qty) || 1));
      subtotal += product.price * qty;
      orderItems.push({
        productId: product.id,
        name: product.nameUz,
        nameRu: product.nameRu,
        price: product.price,
        imageUrl: product.imageUrl,
        qty,
      });
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ error: "Buyurtma uchun yaroqli mahsulot topilmadi" });
    }

    const { discount, promoCodeId } = await resolvePromo(promoCode, subtotal);
    const totalPrice = subtotal + DELIVERY_PRICE - discount;

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        items: orderItems,
        subtotal,
        deliveryPrice: DELIVERY_PRICE,
        discount,
        totalPrice,
        promoCodeId,
        deliveryAddress: deliveryAddress || null,
        deliveryLocation: deliveryLocation || null,
        deliveryDate: deliveryDate || null,
        deliveryTime: deliveryTime || null,
        note: note || null,
        phone: phone || null,
        status: "NEW",
        paymentMethod: method,
        paymentStatus: "pending",
      },
      include: { user: true },
    });

    if (promoCodeId) {
      await prisma.promoCode.update({ where: { id: promoCodeId }, data: { usageCount: { increment: 1 } } });
    }

    // Mijozga buyurtma qabul qilinganini DARHOL bildiramiz — to'lov usulidan
    // qat'i nazar (avval bu xabar umuman yuborilmasdi, mijoz faqat ilova
    // ichidagi "Buyurtma qabul qilindi" ekranini ko'rardi, Telegram orqali
    // hech qanday tasdiq kelmasdi).
    notifyOrderStatusChange(order);

    if (method === "cash") {
      notifyStaffNewOrder(order);
      return res.status(201).json(serializeOrder(order));
    }

    const paymentUrl = buildPaymentUrl(method, order);
    res.status(201).json({ ...serializeOrder(order), paymentUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Buyurtma yaratishda xatolik" });
  }
});

// POST /api/orders/custom-cake  (Mini App: "🎂 Maxsus tort buyurtma qilish")
// Narxi oldindan noma'lum — admin ko'rib chiqib narx belgilaydi (cake-price endpoint),
// shundan keyingina mijozga to'lov havolasi/naqd tasdiq so'raladi (bu MVP'da
// darhol "naqd, narx kelishiladi" tarzida yaratiladi; keyin admin narxni kiritadi).
router.post("/custom-cake", requireTelegramAuth, async (req, res) => {
  try {
    const {
      cakeType, cakeSize, cakeFlavor, cakeDesign, cakeText, cakeNote, cakeImageUrl,
      deliveryAddress, deliveryLocation, deliveryDate, deliveryTime, note, phone,
    } = req.body;
    const tgUser = req.telegramUser;

    if (!cakeType || !cakeSize) {
      return res.status(400).json({ error: "Tort turi va hajmi kerak" });
    }

    const user = await upsertUser(tgUser, phone);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        isCustomCake: true,
        cakeType, cakeSize,
        cakeFlavor: cakeFlavor || null,
        cakeDesign: cakeDesign || null,
        cakeText: cakeText || null,
        cakeNote: cakeNote || null,
        cakeImageUrl: cakeImageUrl || null,
        cakePrice: null,
        subtotal: 0,
        deliveryPrice: DELIVERY_PRICE,
        discount: 0,
        totalPrice: 0,
        deliveryAddress: deliveryAddress || null,
        deliveryLocation: deliveryLocation || null,
        deliveryDate: deliveryDate || null,
        deliveryTime: deliveryTime || null,
        note: note || null,
        phone: phone || null,
        status: "NEW",
        paymentMethod: "cash",
        paymentStatus: "pending",
      },
      include: { user: true },
    });

    notifyOrderStatusChange(order);
    notifyStaffCustomCake(order);
    res.status(201).json(serializeOrder(order));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Maxsus tort buyurtmasini yaratishda xatolik" });
  }
});

module.exports = router;
