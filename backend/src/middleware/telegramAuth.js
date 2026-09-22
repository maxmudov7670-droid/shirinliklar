const crypto = require("crypto");

/**
 * Telegram Mini App yuboradigan "initData" satrini tekshiradi.
 * Rasmiy algoritm: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * MUHIM: bu shirinliklar botining O'Z BOT_TOKEN'i bilan tekshiriladi —
 * mavjud ovqat botining tokeniga hech qanday aloqasi yo'q.
 */
function verifyInitData(initData, botToken) {
  if (!initData || typeof initData !== "string") return null;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get("hash");
  if (!hash) return null;
  urlParams.delete("hash");

  const dataCheckArr = [];
  for (const [key, value] of [...urlParams.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    dataCheckArr.push(`${key}=${value}`);
  }
  const dataCheckString = dataCheckArr.join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  if (computedHash !== hash) return null;

  const authDate = Number(urlParams.get("auth_date"));
  if (authDate && Date.now() / 1000 - authDate > 60 * 60 * 24) {
    return null;
  }

  const userRaw = urlParams.get("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  return { user, authDate };
}

function requireTelegramAuth(req, res, next) {
  const initData = req.header("X-Telegram-Init-Data");
  const result = verifyInitData(initData, process.env.BOT_TOKEN);

  if (!result || !result.user) {
    return res.status(401).json({ error: "Telegram autentifikatsiyasi muvaffaqiyatsiz" });
  }

  req.telegramUser = result.user;
  next();
}

module.exports = { verifyInitData, requireTelegramAuth };
