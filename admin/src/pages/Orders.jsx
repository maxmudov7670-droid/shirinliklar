import { useEffect, useState } from "react";
import { api } from "../lib/api";

const STATUSES = [
  { id: "NEW", label: "🆕 Yangi" },
  { id: "ACCEPTED", label: "✅ Qabul qilindi" },
  { id: "PREPARING", label: "👩‍🍳 Tayyorlanmoqda" },
  { id: "READY", label: "📦 Tayyor" },
  { id: "DELIVERING", label: "🚚 Yetkazilmoqda" },
  { id: "DELIVERED", label: "✔️ Yetkazildi" },
  { id: "CANCELLED", label: "❌ Bekor qilindi" },
];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  function load() {
    api.get(`/api/orders${filter ? `?status=${filter}` : ""}`).then(setOrders);
  }

  useEffect(load, [filter]);

  async function changeStatus(id, status) {
    await api.patch(`/api/orders/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-cocoa mb-4">📦 Buyurtmalar</h1>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button onClick={() => setFilter("")} className={`text-xs px-3 py-1.5 rounded-full shrink-0 ${!filter ? "bg-chocolate text-cream" : "bg-white text-cocoa"}`}>
          Barchasi
        </button>
        {STATUSES.map((s) => (
          <button key={s.id} onClick={() => setFilter(s.id)}
            className={`text-xs px-3 py-1.5 rounded-full shrink-0 ${filter === s.id ? "bg-chocolate text-cream" : "bg-white text-cocoa"}`}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {orders.length === 0 && <div className="text-cocoa/50 text-sm">Buyurtmalar topilmadi</div>}
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-cocoa">
                  #{o.id} {o.isCustomCake && "🎂"} — {o.customerName}
                </div>
                <div className="text-xs text-chocolate/60">{o.customerPhone} · {new Date(o.createdAt).toLocaleString("uz-UZ")}</div>
              </div>
              <select
                value={o.status}
                onChange={(e) => changeStatus(o.id, e.target.value)}
                className="text-xs rounded-lg border border-beige px-2 py-1"
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="mt-2 text-sm text-cocoa/80">
              {o.isCustomCake ? (
                <div>
                  🎂 {o.cake?.type}, {o.cake?.size}
                  {o.cake?.flavor && `, ${o.cake.flavor}`}
                  {o.cake?.price ? (
                    <span> — {o.cake.price.toLocaleString("uz-UZ")} so'm</span>
                  ) : (
                    <span className="text-red-500"> — narx belgilanmagan</span>
                  )}
                </div>
              ) : (
                <div>{(o.items || []).map((i) => `${i.name} x${i.qty}`).join(", ")}</div>
              )}
            </div>

            <div className="mt-2 flex justify-between items-center text-sm">
              <span className="text-chocolate/60">
                📍 {o.deliveryAddress || "—"} {o.deliveryDate && `· ${o.deliveryDate} ${o.deliveryTime || ""}`}
              </span>
              <span className="font-semibold text-cocoa">
                {o.totalPrice ? `${o.totalPrice.toLocaleString("uz-UZ")} so'm` : "narx kelishiladi"}
              </span>
            </div>
            {o.note && <div className="mt-1 text-xs text-chocolate/60">📝 {o.note}</div>}
            <div className="mt-1 text-xs text-chocolate/50">
              💳 {o.paymentMethodLabelUz} — {o.paymentStatus === "paid" ? "✅ to'landi" : "kutilmoqda"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
