const { Telegraf, Markup } = require("telegraf");
const { statusMessage } = require("../lib/orderStatus");

// MUHIM: bu ALOHIDA Telegram bot — o'zining BOT_TOKEN'idan foydalanadi,
// mavjud ovqat botining tokeniga hech qanday aloqasi yo'q.
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  const miniAppUrl = process.env.MINIAPP_URL;
  const firstName = ctx.from?.first_name || "";

  ctx.reply(
    `Assalomu alaykum, ${firstName}! 🍰\n\nShirinliklar do'koniga xush kelibsiz!\nEng mazali tortlar, kapkeyklar va desertlarni buyurtma qilish uchun tugmani bosing 👇`,
    Markup.inlineKeyboard([Markup.button.webApp("🍰 Buyurtma berish", miniAppUrl)])
  );
});

bot.help((ctx) => {
  ctx.reply("Buyurtma berish uchun /start buyrug'ini yuboring va ochilgan tugma orqali ilovani oching.");
});

// Xodimlar guruhini sozlash uchun: shu buyruq guruh ID'sini aytadi —
// shuni STAFF_CHAT_ID muhit o'zgaruvchisiga yozasiz.
bot.command("groupid", (ctx) => {
  if (ctx.chat.type === "group" || ctx.chat.type === "supergroup") {
    ctx.reply(`Ushbu guruh ID: \`${ctx.chat.id}\``, { parse_mode: "Markdown" });
  } else {
    ctx.reply("Bu buyruq faqat guruh chatida ishlaydi.");
  }
});

function getStaffChatId() {
  return process.env.STAFF_CHAT_ID;
}

function formatMoney(n) {
  return new Intl.NumberFormat("uz-UZ").format(n || 0);
}

function formatOrderForStaff(order) {
  const customerName = [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") || "Noma'lum";
  const itemsText = (order.items || [])
    .map((i) => `• ${i.name} x${i.qty} — ${formatMoney(i.price * i.qty)} so'm`)
    .join("\n");

  return (
    `🆕 *Yangi buyurtma* — #${order.id}\n\n` +
    `👤 ${customerName}\n` +
    `📞 ${order.user.phone || order.phone || "-"}\n` +
    `📍 ${order.deliveryAddress || "Manzil ko'rsatilmagan"}\n` +
    `📅 ${order.deliveryDate || "-"} ${order.deliveryTime || ""}\n\n` +
    `${itemsText}\n\n` +
    `💰 Jami: ${formatMoney(order.totalPrice)} so'm\n` +
    `💳 To'lov: ${order.paymentMethod}` +
    (order.note ? `\n📝 ${order.note}` : "")
  );
}

function formatCakeForStaff(order) {
  const customerName = [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") || "Noma'lum";
  return (
    `🎂 *Maxsus tort buyurtmasi* — #${order.id}\n\n` +
    `👤 ${customerName}\n` +
    `📞 ${order.user.phone || order.phone || "-"}\n\n` +
    `🎂 Turi: ${order.cakeType}\n` +
    `📏 Hajmi: ${order.cakeSize}\n` +
    (order.cakeFlavor ? `🍫 Ta'mi: ${order.cakeFlavor}\n` : "") +
    (order.cakeDesign ? `🎨 Dizayni: ${order.cakeDesign}\n` : "") +
    (order.cakeText ? `✏️ Yozuv: "${order.cakeText}"\n` : "") +
    `📅 Kerakli sana: ${order.deliveryDate || "-"} ${order.deliveryTime || ""}\n` +
    `📍 ${order.deliveryAddress || "Manzil ko'rsatilmagan"}\n` +
    (order.cakeNote ? `\n📝 ${order.cakeNote}\n` : "") +
    `\n⚠️ Narx hali belgilanmagan — Admin Panelda "Maxsus tortlar" bo'limidan narx belgilang.`
  );
}

async function notifyStaffNewOrder(order) {
  const chatId = getStaffChatId();
  if (!chatId) return;
  try {
    await bot.telegram.sendMessage(chatId, formatOrderForStaff(order), { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Xodimlar guruhiga xabar yuborishda xatolik:", err.message);
  }
}

async function notifyStaffCustomCake(order) {
  const chatId = getStaffChatId();
  if (!chatId) return;
  try {
    const message = { text: formatCakeForStaff(order), parse_mode: "Markdown" };
    if (order.cakeImageUrl) {
      await bot.telegram.sendPhoto(chatId, order.cakeImageUrl, {
        caption: message.text,
        parse_mode: "Markdown",
      });
    } else {
      await bot.telegram.sendMessage(chatId, message.text, { parse_mode: "Markdown" });
    }
  } catch (err) {
    console.error("Xodimlar guruhiga maxsus tort xabarini yuborishda xatolik:", err.message);
  }
}

// Buyurtma holati o'zgarganda mijozga UNING TILIDA (uz/ru) xabar yuboradi.
async function notifyOrderStatusChange(order) {
  const lang = order.user?.languageCode === "ru" ? "ru" : "uz";
  const text = statusMessage(order.status, lang, order.id);
  if (!text) return;
  try {
    await bot.telegram.sendMessage(order.user.telegramId, text);
  } catch (err) {
    console.error(`Foydalanuvchi ${order.user.telegramId}ga xabar yuborishda xatolik:`, err.message);
  }
}

module.exports = {
  bot,
  notifyStaffNewOrder,
  notifyStaffCustomCake,
  notifyOrderStatusChange,
};
