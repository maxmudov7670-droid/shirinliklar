const express = require("express");
const prisma = require("../lib/prisma");
const { requireAdminAuth } = require("../middleware/adminAuth");

const router = express.Router();

// GET /api/reports/dashboard — Admin Panel bosh sahifasi uchun statistika
router.get("/dashboard", requireAdminAuth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayOrders, todayRevenueAgg, totalCustomers, pendingCakeOrders, allOrders] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startOfDay }, status: { not: "CANCELLED" } },
        _sum: { totalPrice: true },
      }),
      prisma.user.count(),
      prisma.order.count({ where: { isCustomCake: true, cakePrice: null, status: { not: "CANCELLED" } } }),
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" }, isCustomCake: false },
        select: { items: true },
      }),
    ]);

    // Eng ko'p sotilgan mahsulotlar — items JSON ichidan hisoblanadi
    const salesByProduct = new Map();
    for (const order of allOrders) {
      for (const item of order.items || []) {
        const key = item.productId;
        const current = salesByProduct.get(key) || { name: item.name, qty: 0 };
        current.qty += item.qty;
        salesByProduct.set(key, current);
      }
    }
    const topProducts = [...salesByProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    res.json({
      todayOrders,
      todayRevenue: todayRevenueAgg._sum.totalPrice || 0,
      totalCustomers,
      pendingCakeOrders,
      topProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Statistikani olishda xatolik" });
  }
});

module.exports = router;
