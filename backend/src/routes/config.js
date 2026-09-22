const express = require("express");
const { isClickConfigured, isPaymeConfigured } = require("../lib/paymentLinks");

const router = express.Router();

// GET /api/config — Mini App shu orqali qaysi to'lov usullari faolligini
// va yetkazib berish narxini bilib oladi.
router.get("/", (req, res) => {
  res.json({
    cash: true,
    click: isClickConfigured() && process.env.CLICK_TEST_MODE !== "true",
    payme: isPaymeConfigured() && process.env.PAYME_TEST_MODE !== "true",
    deliveryPrice: Number(process.env.DELIVERY_PRICE || 0),
    languages: ["uz", "ru"],
  });
});

module.exports = router;
