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

// Buyurtma birinchi marta yaratilganda (hali xodim tasdiqlamasdan) mijozga
// darhol yuboriladigan "qabul qilindi" xabari — agar mijoz yetkazib berish
// sanasi/vaqtini kiritgan bo'lsa, o'shani ham eslatib o'tadi.
function formatWhenUz(order) {
  if (!order.deliveryDate) return " Tez orada operatorlarimiz siz bilan bog'lanadi.";
  const time = order.deliveryTime ? `, soat ${order.deliveryTime}` : "";
  return ` Belgilangan vaqtda (${order.deliveryDate}${time}) yetkazib beramiz.`;
}
function formatWhenRu(order) {
  if (!order.deliveryDate) return " Скоро наши операторы свяжутся с вами.";
  const time = order.deliveryTime ? `, в ${order.deliveryTime}` : "";
  return ` Доставим в назначенное время (${order.deliveryDate}${time}).`;
}

// Holat o'zgarganda mijozga yuboriladigan xabar (faqat mazmunli bosqichlar uchun)
const STATUS_MESSAGES = {
  NEW: {
    uz: (order) => `🆕 Buyurtmangiz (#${order.id}) qabul qilindi!${formatWhenUz(order)}`,
    ru: (order) => `🆕 Ваш заказ (#${order.id}) принят!${formatWhenRu(order)}`,
  },
  ACCEPTED: {
    uz: (order) => `✅ Buyurtmangiz (#${order.id}) qabul qilindi! Tez orada tayyorlashni boshlaymiz.`,
    ru: (order) => `✅ Ваш заказ (#${order.id}) принят! Скоро начнём готовить.`,
  },
  PREPARING: {
    uz: (order) => `👩‍🍳 Buyurtmangiz (#${order.id}) tayyorlanmoqda.`,
    ru: (order) => `👩‍🍳 Ваш заказ (#${order.id}) готовится.`,
  },
  READY: {
    uz: (order) => `📦 Buyurtmangiz (#${order.id}) tayyor bo'ldi!`,
    ru: (order) => `📦 Ваш заказ (#${order.id}) готов!`,
  },
  DELIVERING: {
    uz: (order) => `🚚 Buyurtmangiz (#${order.id}) yetkazib berilmoqda.`,
    ru: (order) => `🚚 Ваш заказ (#${order.id}) уже в пути.`,
  },
  DELIVERED: {
    uz: (order) => `✔️ Buyurtmangiz (#${order.id}) yetkazildi. Yoqimli ishtaha! 🍰`,
    ru: (order) => `✔️ Ваш заказ (#${order.id}) доставлен. Приятного аппетита! 🍰`,
  },
  CANCELLED: {
    uz: (order) => `❌ Buyurtmangiz (#${order.id}) bekor qilindi.`,
    ru: (order) => `❌ Ваш заказ (#${order.id}) отменён.`,
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

// `order` — kamida { id, deliveryDate, deliveryTime } maydonlariga ega bo'lishi kerak.
function statusMessage(status, lang, order) {
  const build = STATUS_MESSAGES[status]?.[lang];
  return build ? build(order) : null;
}

module.exports = { STATUS_LABELS, STATUS_MESSAGES, PAYMENT_METHOD_LABELS, statusLabel, statusMessage };
