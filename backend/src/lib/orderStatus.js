// Buyurtma holatlari — ikki tilda (uz/ru) yorliq va mijozga yuboriladigan xabar matni.

const STATUS_LABELS = {
  NEW: { uz: "🆕 Yangi", ru: "🆕 Новый" },
  ACCEPTED: { uz: "✅ Qabul qilindi", ru: "✅ Принят" },
  PREPARING: { uz: "👩‍🍳 Tayyorlanmoqda", ru: "👩‍🍳 Готовится" },
  READY: { uz: "📦 Tayyor", ru: "📦 Готов" },
  DELIVERING: { uz: "🚚 Yetkazilmoqda", ru: "🚚 В пути" },
  DELIVERED: { uz: "✔️ Yetkazildi", ru: "✔️ Доставлен" },
  CANCELLED: { uz: "❌ Bekor qilindi", ru: "❌ Отменён" },
};

// Holat o'zgarganda mijozga yuboriladigan xabar (faqat mazmunli bosqichlar uchun)
const STATUS_MESSAGES = {
  ACCEPTED: {
    uz: (id) => `✅ Buyurtmangiz (#${id}) qabul qilindi! Tez orada tayyorlashni boshlaymiz.`,
    ru: (id) => `✅ Ваш заказ (#${id}) принят! Скоро начнём готовить.`,
  },
  PREPARING: {
    uz: (id) => `👩‍🍳 Buyurtmangiz (#${id}) tayyorlanmoqda.`,
    ru: (id) => `👩‍🍳 Ваш заказ (#${id}) готовится.`,
  },
  READY: {
    uz: (id) => `📦 Buyurtmangiz (#${id}) tayyor bo'ldi!`,
    ru: (id) => `📦 Ваш заказ (#${id}) готов!`,
  },
  DELIVERING: {
    uz: (id) => `🚚 Buyurtmangiz (#${id}) yetkazib berilmoqda.`,
    ru: (id) => `🚚 Ваш заказ (#${id}) уже в пути.`,
  },
  DELIVERED: {
    uz: (id) => `✔️ Buyurtmangiz (#${id}) yetkazildi. Yoqimli ishtaha! 🍰`,
    ru: (id) => `✔️ Ваш заказ (#${id}) доставлен. Приятного аппетита! 🍰`,
  },
  CANCELLED: {
    uz: (id) => `❌ Buyurtmangiz (#${id}) bekor qilindi.`,
    ru: (id) => `❌ Ваш заказ (#${id}) отменён.`,
  },
};

const PAYMENT_METHOD_LABELS = {
  cash: { uz: "Naqd pul", ru: "Наличными" },
  click: { uz: "Click", ru: "Click" },
  payme: { uz: "Payme", ru: "Payme" },
};

function statusLabel(status, lang) {
  return STATUS_LABELS[status]?.[lang] || status;
}

function statusMessage(status, lang, orderId) {
  const build = STATUS_MESSAGES[status]?.[lang];
  return build ? build(orderId) : null;
}

module.exports = { STATUS_LABELS, STATUS_MESSAGES, PAYMENT_METHOD_LABELS, statusLabel, statusMessage };
