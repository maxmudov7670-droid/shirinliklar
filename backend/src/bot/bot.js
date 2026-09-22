const { Telegraf, Markup } = require("telegraf");
const prisma = require("../lib/prisma");
const { STATUS_LABELS, statusMessage, statusLabel } = require("../lib/orderStatus");

// Guruhda holat tugmalari qaysi holatlarga o'tkazishga ruxsat berishini
// belgilaydi (NEW — boshlang'ich holat, tugma kerak emas).
const STATUS_ACTIONS = Object.keys(STATUS_LABELS).filter((s) => s !== "NEW");

// MUHIM: bu ALOHIDA Telegram bot — o'zining BOT_TOKEN'idan foydalanadi,
// mavjud ovqat botining tokeniga hech qanday aloqasi yo'q.
const bot = new Telegraf(process.env.BOT_TOKEN);

async function getStartImage() {
  try {
    const s = await prisma.settings.findUnique({ where: { id: 1 } });
    return s?.startImage || null;
  } catch (err) {
    console.error("Sozlamalarni (logo) o'qishda xatolik:", err.message);
    return null;
  }
}

bot.start(async (ctx) => {
  const miniAppUrl = process.env.MINIAPP_URL;
  const firstName = ctx.from?.first_name || "";
  const caption = `Assalomu alaykum, ${firstName}! 🍰\n\nShirinliklar do'koniga xush kelibsiz!\nEng mazali tortlar, kapkeyklar va desertlarni buyurtma qilish uchun tugmani bosing 👇`;
  const keyboard = Markup.inlineKeyboard([Markup.button.webApp("🍰 Buyurtma berish", miniAppUrl)]);

  const startImage = await getStartImage();
  if (startImage) {
    // Rasm bilan yuborishda muvaffaqiyatsiz bo'lsa (masalan havola buzilgan
    // bo'lsa), botning butunlay javob bermay qolmasligi uchun oddiy matnga
    // qaytamiz.
    try {
      await ctx.replyWithPhoto(startImage, { caption, ...keyboard });
      return;
    } catch (err) {
      console.error("/start logosi bilan yuborishda xatolik, matn bilan yuborilmoqda:", err.message);
    }
  }
  await ctx.reply(caption, keyboard);
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

// Agar guruh oddiy guruhdan SUPERGURUHGA aylantirilgan bo'lsa (Telegram buni
// a'zolar ko'payganda yoki ba'zi sozlamalar yoqilganda avtomatik qiladi),
// uning chat ID'si butunlay o'zgaradi — eski STAFF_CHAT_ID endi ishlamay
// qoladi va Telegram "group chat was upgraded to a supergroup chat" xatosini
// qaytaradi. Bu xato javobida YANGI ID (`migrate_to_chat_id`) ham keladi —
// shuni ishlatib xabarni bir marta qayta yuboramiz, xabar yo'qolib
// qolmasin. Doimiy yechim uchun konsolga aniq ko'rsatma ham yozib qo'yamiz.
async function sendWithMigrationRetry(chatId, sendFn) {
  try {
    return await sendFn(chatId);
  } catch (err) {
    const newChatId = err.parameters?.migrate_to_chat_id;
    if (newChatId) {
      console.error(
        `⚠️ Guruh superguruhga aylandi — eski STAFF_CHAT_ID (${chatId}) endi ishlamaydi. ` +
          `Render'dagi STAFF_CHAT_ID qiymatini ${newChatId} ga o'zgartiring. Hozircha xabar shu yangi ID orqali yuborilmoqda.`
      );
      return sendFn(newChatId);
    }
    throw err;
  }
}

// Guruh xabari ostidagi "buyurtma holati" tugmalari — bosilganda callback_data
// sifatida "status:<orderId>:<STATUS>" yuboriladi. Joriy holat "✅" bilan
// belgilanadi, shunda xodimlar buyurtma qaysi bosqichda ekanini darhol ko'radi.
function buildStatusKeyboard(orderId, currentStatus) {
  const rows = [
    ["ACCEPTED", "PREPARING"],
    ["READY", "DELIVERING"],
    ["DELIVERED", "CANCELLED"],
  ];
  return Markup.inlineKeyboard(
    rows.map((row) =>
      row.map((status) => {
        const label = statusLabel(status, "uz");
        const text = status === currentStatus ? `✅ ${label}` : label;
        return Markup.button.callback(text, `status:${orderId}:${status}`);
      })
    )
  );
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
    await sendWithMigrationRetry(chatId, (id) =>
      bot.telegram.sendMessage(id, formatOrderForStaff(order), {
        parse_mode: "Markdown",
        ...buildStatusKeyboard(order.id, order.status),
      })
    );
  } catch (err) {
    console.error("Xodimlar guruhiga xabar yuborishda xatolik:", err.message);
  }
}

async function notifyStaffCustomCake(order) {
  const chatId = getStaffChatId();
  if (!chatId) return;
  try {
    const message = { text: formatCakeForStaff(order), parse_mode: "Markdown" };
    const keyboard = buildStatusKeyboard(order.id, order.status);
    if (order.cakeImageUrl) {
      await sendWithMigrationRetry(chatId, (id) =>
        bot.telegram.sendPhoto(id, order.cakeImageUrl, {
          caption: message.text,
          parse_mode: "Markdown",
          ...keyboard,
        })
      );
    } else {
      await sendWithMigrationRetry(chatId, (id) =>
        bot.telegram.sendMessage(id, message.text, { parse_mode: "Markdown", ...keyboard })
      );
    }
  } catch (err) {
    console.error("Xodimlar guruhiga maxsus tort xabarini yuborishda xatolik:", err.message);
  }
}

// Guruhdagi "buyurtma holati" tugmalaridan biri bosilganda ishga tushadi.
// FAQAT GURUH ADMINI (yoki egasi) buyurtma holatini o'zgartira oladi —
// oddiy a'zolar bossa, ularga shunchaki ruxsat yo'qligi haqida (faqat
// o'ziga ko'rinadigan) ogohlantirish chiqadi, xabar/tugmalar o'zgarmaydi.
bot.action(/^status:(\d+):([A-Z_]+)$/, async (ctx) => {
  const [, orderIdStr, status] = ctx.match;
  const orderId = Number(orderIdStr);
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;

  if (!STATUS_ACTIONS.includes(status)) {
    return ctx.answerCbQuery("Noto'g'ri holat qiymati.");
  }
  if (!chatId || !userId) {
    return ctx.answerCbQuery("Xatolik yuz berdi.");
  }

  try {
    const member = await ctx.telegram.getChatMember(chatId, userId);
    const isAdmin = member.status === "creator" || member.status === "administrator";
    if (!isAdmin) {
      return ctx.answerCbQuery("⛔ Faqat guruh admini buyurtma holatini o'zgartira oladi.", { show_alert: true });
    }
  } catch (err) {
    console.error("Guruh a'zoligini tekshirishda xatolik:", err.message);
    return ctx.answerCbQuery("Ruxsatni tekshirib bo'lmadi. Birozdan so'ng qayta urinib ko'ring.", { show_alert: true });
  }

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { user: true },
    });
    await ctx.answerCbQuery(`✅ Holat yangilandi: ${statusLabel(status, "uz")}`);
    notifyOrderStatusChange(order);
    try {
      await ctx.editMessageReplyMarkup(buildStatusKeyboard(orderId, status).reply_markup);
    } catch (err) {
      // Tugmalar allaqachon shu holatda bo'lsa Telegram xato qaytaradi —
      // bu muammo emas, e'tiborsiz qoldiramiz.
    }
  } catch (err) {
    console.error("Buyurtma holatini guruhdan yangilashda xatolik:", err.message);
    await ctx.answerCbQuery("Holatni yangilashda xatolik yuz berdi.", { show_alert: true });
  }
});

// Buyurtma holati o'zgarganda (shu jumladan yangi yaratilganda, status="NEW")
// mijozga UNING TILIDA (uz/ru) xabar yuboradi.
async function notifyOrderStatusChange(order) {
  if (!order.user?.telegramId) return;
  const lang = order.user?.languageCode === "ru" ? "ru" : "uz";
  const text = statusMessage(order.status, lang, order);
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
