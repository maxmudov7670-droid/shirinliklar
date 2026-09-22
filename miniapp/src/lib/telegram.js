// Telegram WebApp SDK bilan ishlash uchun kichik yordamchi qatlam.
// Brauzerda (Telegram tashqarisida) test qilinsa ham xato bermasligi uchun
// har bir chaqiruv xavfsiz tekshiriladi.

function tg() {
  return typeof window !== "undefined" ? window.Telegram?.WebApp : null;
}

export function initTelegram() {
  const app = tg();
  if (!app) return;
  app.ready();
  app.expand();
  // Eski Telegram klientlarida pastga/yuqoriga qattiq svayp qilinsa ilova
  // yarim yopiq (yoyilmagan, xira fonli) holatga qaytib qolishi mumkin —
  // buni oldini olamiz. Yangi Bot API'da mavjud, eskisida yo'q bo'lishi
  // mumkin, shuning uchun xavfsiz (?.()) chaqiriladi.
  app.disableVerticalSwipes?.();
  // Extra himoya: agar biror sababdan hali yoyilmagan bo'lsa (masalan
  // birinchi renderda expand() ulgurmagan bo'lsa), viewport o'zgarganda
  // qayta urinib ko'ramiz.
  app.onEvent?.("viewportChanged", () => {
    if (!app.isExpanded) app.expand();
  });
}

export function getInitData() {
  return tg()?.initData || "";
}

export function getTelegramUser() {
  return tg()?.initDataUnsafe?.user || null;
}

export function getLanguageHint() {
  const code = tg()?.initDataUnsafe?.user?.language_code;
  return code === "ru" ? "ru" : "uz";
}

export function hapticSelect() {
  tg()?.HapticFeedback?.selectionChanged?.();
}

export function hapticSuccess() {
  tg()?.HapticFeedback?.notificationOccurred?.("success");
}

export function requestLocation(onResult) {
  const app = tg();
  if (!app?.LocationManager) {
    onResult(null);
    return;
  }
  app.LocationManager.init(() => {
    app.LocationManager.getLocation((loc) => onResult(loc));
  });
}

export function requestPhone(onResult) {
  const app = tg();
  if (!app) {
    onResult(null);
    return;
  }
  app.requestContact((shared, data) => {
    onResult(shared ? data?.responseUnsafe?.contact?.phone_number || null : null);
  });
}

export function closeApp() {
  tg()?.close();
}
