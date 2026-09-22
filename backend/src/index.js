require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { bot } = require("./bot/bot");
const categoriesRouter = require("./routes/categories");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/users");
const ordersRouter = require("./routes/orders");
const promocodesRouter = require("./routes/promocodes");
const configRouter = require("./routes/config");
const adminRouter = require("./routes/admin");
const paymentsRouter = require("./routes/payments");
const uploadRouter = require("./routes/upload");
const reportsRouter = require("./routes/reports");
const settingsRouter = require("./routes/settings");

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

const PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL || null;
const WEBHOOK_PATH = `/telegraf/${process.env.BOT_TOKEN}`;

if (PUBLIC_URL) {
  // Bepul tarifda server uxlab qolgani uchun webhook rejimi ishlatiladi —
  // kelgan so'rov serverni "uyg'otadi". Boshqa yo'llardan OLDIN ro'yxatga
  // olinishi shart, aks holda so'rov bu yerga yetib bormaydi.
  app.use(bot.webhookCallback(WEBHOOK_PATH));
}

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "shirinliklar-backend" });
});

app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/promocodes", promocodesRouter);
app.use("/api/config", configRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/settings", settingsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Topilmadi" });
});

app.use((err, req, res, next) => {
  console.error("Kutilmagan xatolik:", err);
  res.status(500).json({ error: "Server xatoligi" });
});

const PORT = process.env.PORT || 4000;

async function start() {
  if (!process.env.BOT_TOKEN) {
    console.error("BOT_TOKEN topilmadi! .env faylini tekshiring.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL topilmadi! .env faylini tekshiring.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`✅ Backend API ${PORT}-portda ishga tushdi`);
  });

  if (PUBLIC_URL) {
    // Webhook o'rnatish vaqtinchalik tarmoq xatosi bilan muvaffaqiyatsiz
    // bo'lsa ham server qulab tushmasin — log qilinadi va 10 soniyadan
    // so'ng bitta marta qayta urinib ko'riladi.
    try {
      await bot.telegram.setWebhook(`${PUBLIC_URL}${WEBHOOK_PATH}`);
      console.log(`✅ Telegram bot webhook rejimida ishga tushdi: ${PUBLIC_URL}${WEBHOOK_PATH}`);
    } catch (err) {
      console.error("⚠️ Webhook o'rnatilmadi (server baribir ishlaydi, 10s dan so'ng qayta urinamiz):", err.message);
      setTimeout(async () => {
        try {
          await bot.telegram.setWebhook(`${PUBLIC_URL}${WEBHOOK_PATH}`);
          console.log("✅ Telegram bot webhook qayta urinishda ishga tushdi");
        } catch (err2) {
          console.error("⚠️ Webhook qayta urinishda ham o'rnatilmadi:", err2.message);
        }
      }, 10000);
    }
  } else {
    await bot.telegram.deleteWebhook({ drop_pending_updates: false });
    await bot.launch();
    console.log("✅ Telegram bot ishga tushdi (polling rejimida)");
  }
}

start();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
