import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useLang } from "../i18n/LangContext";
import { useCart } from "../lib/CartContext";
import { requestLocation, requestPhone, hapticSuccess } from "../lib/telegram";
import TopBar from "../components/TopBar";

export default function Checkout() {
  const { t } = useLang();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [config, setConfig] = useState({ cash: true, click: false, payme: false, deliveryPrice: 0 });
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [payment, setPayment] = useState("cash");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/config").then(setConfig).catch(() => {});
  }, []);

  const discount = promo?.discount || 0;
  const total = subtotal + (config.deliveryPrice || 0) - discount;

  function shareLocation() {
    requestLocation((loc) => {
      if (loc) {
        setLocation(`${loc.latitude},${loc.longitude}`);
      }
    });
  }

  function sharePhone() {
    requestPhone((num) => {
      if (num) setPhone(num);
    });
  }

  function applyPromo() {
    setPromoError("");
    if (!promoInput.trim()) return;
    api
      .post("/api/promocodes/check", { code: promoInput.trim(), subtotal })
      .then(setPromo)
      .catch((e) => setPromoError(e.message));
  }

  async function submit() {
    setError("");
    if (!address.trim() || !phone.trim()) {
      setError(t("required"));
      return;
    }
    setSubmitting(true);
    try {
      const order = await api.post("/api/orders", {
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        deliveryAddress: address,
        deliveryLocation: location,
        deliveryDate: date,
        deliveryTime: time,
        phone,
        note,
        paymentMethod: payment,
        promoCode: promo?.code,
      });
      clearCart();
      hapticSuccess();
      if (order.paymentUrl) {
        window.location.href = order.paymentUrl;
      } else {
        navigate(`/order-success/${order.id}`);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pb-24">
      <TopBar title={t("checkout")} showBack />

      <div className="px-4 mt-4 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-cocoa">{t("address")}</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full mt-1 rounded-xl border border-beige px-3 py-2 text-sm bg-white"
          />
          <button
            onClick={shareLocation}
            className="text-sm font-medium bg-beige text-cocoa rounded-xl px-3 py-2 mt-1.5"
          >
            📍 {t("sendLocation")} {location && "✓"}
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-cocoa">{t("date")}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 rounded-xl border border-beige px-3 py-2 text-sm bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-cocoa">{t("time")}</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full mt-1 rounded-xl border border-beige px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-cocoa">{t("phone")}</label>
          <div className="flex gap-2 mt-1">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998"
              className="flex-1 rounded-xl border border-beige px-3 py-2 text-sm bg-white"
            />
            <button onClick={sharePhone} className="text-xs bg-beige text-cocoa rounded-xl px-3">
              {t("sharePhone")}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-cocoa">{t("note")}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full mt-1 rounded-xl border border-beige px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-cocoa">{t("promoCode")}</label>
          <div className="flex gap-2 mt-1">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              className="flex-1 rounded-xl border border-beige px-3 py-2 text-sm bg-white uppercase"
            />
            <button onClick={applyPromo} className="text-xs bg-beige text-cocoa rounded-xl px-3">
              {t("applyPromo")}
            </button>
          </div>
          {promoError && <div className="text-xs text-red-500 mt-1">{promoError}</div>}
          {promo && <div className="text-xs text-green-600 mt-1">-{promo.discount.toLocaleString("uz-UZ")} {t("som")}</div>}
        </div>

        <div>
          <label className="text-sm font-medium text-cocoa">{t("paymentMethod")}</label>
          <div className="flex gap-2 mt-1">
            {/* Click/Payme hali ulanmagan bo'lsa ham tugma ko'rinib turadi —
                shunchaki "vaqtincha mavjud emas" deb belgilanadi va bosilmaydi,
                avvalgi (ular butunlay yashirilgan) holatdagidek emas. */}
            {[
              { id: "cash", label: t("cash"), enabled: config.cash },
              { id: "click", label: "Click", enabled: config.click },
              { id: "payme", label: "Payme", enabled: config.payme },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={!m.enabled}
                onClick={() => m.enabled && setPayment(m.id)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${
                  !m.enabled
                    ? "bg-beige/50 text-cocoa/40 cursor-not-allowed"
                    : payment === m.id
                    ? "bg-chocolate text-cream"
                    : "bg-beige text-cocoa"
                }`}
              >
                <div>{m.label}</div>
                {!m.enabled && <div className="text-[10px] font-normal leading-tight">{t("temporarilyUnavailable")}</div>}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-chocolate/70">
            <span>{t("subtotal")}</span>
            <span>{subtotal.toLocaleString("uz-UZ")} {t("som")}</span>
          </div>
          <div className="flex justify-between text-chocolate/70">
            <span>{t("delivery")}</span>
            <span>{(config.deliveryPrice || 0).toLocaleString("uz-UZ")} {t("som")}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>{t("discount")}</span>
              <span>-{discount.toLocaleString("uz-UZ")} {t("som")}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-cocoa text-base pt-1 border-t border-beige mt-1">
            <span>{t("total")}</span>
            <span>{total.toLocaleString("uz-UZ")} {t("som")}</span>
          </div>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-chocolate text-cream rounded-full py-3 font-medium disabled:opacity-50"
        >
          {t("placeOrder")}
        </button>
      </div>
    </div>
  );
}
