// Telegram WebApp SDK bilan ishlash uchun kichik yordamchi qatlam.
// Brauzerda (Telegram tashqarisida) test qilinsa ham xato bermasligi uchun
// har bir chaqiruv xavfsiz tekshiriladi.

function tg() {
  return typeof window !== "undefined" ? window.Telegram?.WebApp : null;
}

// Joylashuv so'ralganda xatolik/ruxsat xabarlarini foydalanuvchi tanlagan
// tilda ko'rsatish uchun — LangContext'dagi bilan bir xil kalitdan o'qiydi.
function currentLang() {
  try {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("shirinliklar_lang") : null;
    if (saved === "ru" || saved === "uz") return saved;
  } catch {
    /* localStorage yo'q bo'lsa ham ishlayversin */
  }
  return getLanguageHint();
}

const LOCATION_MESSAGES = {
  uz: {
    unsupported:
      "Joylashuvni yuborish ushbu Telegram versiyasida ishlamaydi. Iltimos, manzilni qo'lda kiriting yoki Telegram ilovasini yangilang.",
    unavailable: "Bu qurilmada joylashuvni aniqlab bo'lmadi. Iltimos, manzilni qo'lda kiriting.",
    denied:
      "Joylashuvga ruxsat berilmadi. Telegram sozlamalaridan ushbu botga joylashuv ruxsatini bering yoki manzilni qo'lda kiriting.",
  },
  ru: {
    unsupported:
      "Отправка геолокации не поддерживается в этой версии Telegram. Введите адрес вручную или обновите приложение.",
    unavailable: "Не удалось определить геолокацию на этом устройстве. Введите адрес вручную.",
    denied:
      "Доступ к геолокации не предоставлен. Разрешите доступ в настройках Telegram или введите адрес вручную.",
  },
};

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
  if (!app) {
    onResult(null);
    return;
  }
  const msg = LOCATION_MESSAGES[currentLang()];
  // Eski Telegram klientlarida LocationManager umuman mavjud bo'lmasligi
  // mumkin — avval shunchaki hech narsa bo'lmagandek jim qolardi, endi
  // sababini ochiq aytamiz.
  if (!app.LocationManager) {
    app.showAlert?.(msg.unsupported);
    onResult(null);
    return;
  }
  app.LocationManager.init(() => {
    if (app.LocationManager.isLocationAvailable === false) {
      app.showAlert?.(msg.unavailable);
      onResult(null);
      return;
    }
    app.LocationManager.getLocation((loc) => {
      // loc == null odatda foydalanuvchi ruxsat bermagani uchun bo'ladi —
      // buni ham indikatsiya qilamiz, aks holda tugma "ishlamayapti" bo'lib
      // ko'rinaveradi.
      if (!loc) app.showAlert?.(msg.denied);
      onResult(loc);
    });
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
