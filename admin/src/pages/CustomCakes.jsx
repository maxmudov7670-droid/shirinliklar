import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function CustomCakes() {
  const [orders, setOrders] = useState([]);
  const [priceInputs, setPriceInputs] = useState({});

  function load() {
    api.get("/api/orders").then((all) => setOrders(all.filter((o) => o.isCustomCake)));
  }

  useEffect(load, []);

  async function setPrice(id) {
    const price = priceInputs[id];
    if (!price) return;
    await api.patch(`/api/orders/${id}/cake-price`, { cakePrice: Number(price) });
    load();
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-cocoa mb-4">🎂 Maxsus tort buyurtmalari</h1>

      <div className="flex flex-col gap-3">
        {orders.length === 0 && <div className="text-cocoa/50 text-sm">Hali maxsus tort buyurtmalari yo'q</div>}
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-cocoa">#{o.id} — {o.customerName}</div>
                <div className="text-xs text-chocolate/60">{o.customerPhone}</div>
              </div>
              {o.cake?.imageUrl && (
                <img src={o.cake.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover" />
              )}
            </div>

            <div className="mt-2 text-sm text-cocoa/80 grid grid-cols-2 gap-x-4 gap-y-1">
              <div>🎂 Turi: {o.cake?.type}</div>
              <div>📏 Hajmi: {o.cake?.size}</div>
              {o.cake?.flavor && <div>🍫 Ta'mi: {o.cake.flavor}</div>}
              {o.cake?.design && <div>🎨 Dizayni: {o.cake.design}</div>}
              {o.cake?.text && <div className="col-span-2">✏️ Yozuv: "{o.cake.text}"</div>}
              {o.cake?.note && <div className="col-span-2">📝 {o.cake.note}</div>}
              <div className="col-span-2">📅 {o.deliveryDate || "-"} {o.deliveryTime || ""}</div>
              <div className="col-span-2">📍 {o.deliveryAddress || "-"}</div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              {o.cake?.price ? (
                <span className="text-sm font-semibold text-cocoa">
                  Narxi: {o.cake.price.toLocaleString("uz-UZ")} so'm
                </span>
              ) : (
                <>
                  <input
                    type="number"
                    placeholder="Narx (so'm)"
                    value={priceInputs[o.id] || ""}
                    onChange={(e) => setPriceInputs({ ...priceInputs, [o.id]: e.target.value })}
                    className="rounded-lg border border-beige px-2 py-1.5 text-sm w-32"
                  />
                  <button onClick={() => setPrice(o.id)} className="bg-chocolate text-cream rounded-lg px-3 py-1.5 text-sm">
                    Narx belgilash
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
