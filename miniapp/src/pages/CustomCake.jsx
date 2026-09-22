import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useLang } from "../i18n/LangContext";
import { requestLocation, requestPhone, hapticSuccess } from "../lib/telegram";
import TopBar from "../components/TopBar";

export default function CustomCake() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [cakeType, setCakeType] = useState("");
  const [cakeSize, setCakeSize] = useState("");
  const [cakeFlavor, setCakeFlavor] = useState("");
  const [cakeDesign, setCakeDesign] = useState("");
  const [cakeText, setCakeText] = useState("");
  const [cakeNote, setCakeNote] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!cakeType.trim() || !cakeSize.trim() || !address.trim() || !phone.trim()) {
      setError(t("required"));
      return;
    }
    setSubmitting(true);
    try {
      let cakeImageUrl = null;
      if (imageFile) {
        const uploaded = await api.upload("/api/upload/cake-reference", imageFile);
        cakeImageUrl = uploaded.url;
      }
      const order = await api.post("/api/orders/custom-cake", {
        cakeType, cakeSize, cakeFlavor, cakeDesign, cakeText, cakeNote, cakeImageUrl,
        deliveryAddress: address,
        deliveryLocation: location,
        deliveryDate: date,
        deliveryTime: time,
        phone,
      });
      hapticSuccess();
      navigate(`/order-success/${order.id}?cake=1`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full mt-1 rounded-xl border border-beige px-3 py-2 text-sm bg-white";

  return (
    <div className="pb-24">
      <TopBar title={`🎂 ${t("customCake")}`} showBack />

      <div className="px-4 mt-4 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium text-cocoa">{t("cakeTypeLabel")} *</label>
          <input value={cakeType} onChange={(e) => setCakeType(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-cocoa">{t("cakeSizeLabel")} *</label>
          <input value={cakeSize} onChange={(e) => setCakeSize(e.target.value)} className={inputClass} placeholder="1 kg, 2 kg..." />
        </div>
        <div>
          <label className="text-sm font-medium text-cocoa">{t("cakeFlavorLabel")}</label>
          <input value={cakeFlavor} onChange={(e) => setCakeFlavor(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-cocoa">{t("cakeDesignLabel")}</label>
          <input value={cakeDesign} onChange={(e) => setCakeDesign(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-cocoa">{t("cakeTextLabel")}</label>
          <input value={cakeText} onChange={(e) => setCakeText(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-cocoa">{t("cakeNoteLabel")}</label>
          <textarea value={cakeNote} onChange={(e) => setCakeNote(e.target.value)} rows={2} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-cocoa">{t("cakeImageLabel")}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full mt-1 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-cocoa">{t("address")} *</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className={inputClass} />
          <button
            onClick={() => requestLocation((loc) => loc && setLocation(`${loc.latitude},${loc.longitude}`))}
            className="text-sm font-medium bg-beige text-cocoa rounded-xl px-3 py-2 mt-1.5"
          >
            📍 {t("sendLocation")} {location && "✓"}
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium text-cocoa">{t("date")}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-cocoa">{t("time")}</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-cocoa">{t("phone")} *</label>
          <div className="flex gap-2 mt-1">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998" className="flex-1 rounded-xl border border-beige px-3 py-2 text-sm bg-white" />
            <button onClick={() => requestPhone((num) => num && setPhone(num))} className="text-xs bg-beige text-cocoa rounded-xl px-3">
              {t("sharePhone")}
            </button>
          </div>
        </div>

        <div className="bg-blush/40 rounded-2xl p-3 text-sm text-cocoa">
          💬 {t("priceOnRequest")}
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full bg-chocolate text-cream rounded-full py-3 font-medium disabled:opacity-50"
        >
          {t("cakeSubmit")}
        </button>
      </div>
    </div>
  );
}
