// Click va Payme uchun to'lov manzillarini (checkout link) yasovchi
// yordamchi funksiyalar. Ikkalasi ham merchant ID/kalitlar sozlanmaguncha
// "faol emas" hisoblanadi — shunda mijozga ko'rsatilmaydi.
// MUHIM: bu loyihaning Click/Payme kalitlari mavjud ovqat botiniki bilan
// ALOHIDA — Render'da bu servisga o'zining kalitlari qo'shiladi.

function isClickConfigured() {
  return Boolean(
    process.env.CLICK_MERCHANT_ID && process.env.CLICK_SERVICE_ID && process.env.CLICK_SECRET_KEY
  );
}

function isPaymeConfigured() {
  return Boolean(process.env.PAYME_MERCHANT_ID && process.env.PAYME_KEY);
}

function buildClickUrl(order) {
  const params = new URLSearchParams({
    service_id: process.env.CLICK_SERVICE_ID,
    merchant_id: process.env.CLICK_MERCHANT_ID,
    amount: String(order.totalPrice),
    transaction_param: String(order.id),
  });
  if (process.env.MINIAPP_URL) {
    params.set("return_url", process.env.MINIAPP_URL);
  }
  return `https://my.click.uz/services/pay?${params.toString()}`;
}

function buildPaymeUrl(order) {
  const amountTiyin = order.totalPrice * 100;
  const raw = `m=${process.env.PAYME_MERCHANT_ID};ac.order_id=${order.id};a=${amountTiyin}`;
  const encoded = Buffer.from(raw).toString("base64");
  const host = process.env.PAYME_TEST_MODE === "true" ? "test.paycom.uz" : "checkout.paycom.uz";
  return `https://${host}/${encoded}`;
}

function buildPaymentUrl(method, order) {
  if (method === "click") return buildClickUrl(order);
  if (method === "payme") return buildPaymeUrl(order);
  return null;
}

module.exports = { isClickConfigured, isPaymeConfigured, buildPaymentUrl };
