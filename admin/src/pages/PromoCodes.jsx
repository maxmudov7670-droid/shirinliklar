import { useEffect, useState } from "react";
import { api } from "../lib/api";

const empty = { code: "", percentOff: "", amountOff: "", minOrderAmount: "", expiresAt: "", isActive: true };

export default function PromoCodes() {
  const [codes, setCodes] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  function load() {
    api.get("/api/promocodes").then(setCodes);
  }

  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/promocodes", form);
      setForm(empty);
      load();
    } catch (e2) {
      setError(e2.message);
    }
  }

  async function toggle(c) {
    await api.put(`/api/promocodes/${c.id}`, { isActive: !c.isActive });
    load();
  }

  async function remove(id) {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await api.del(`/api/promocodes/${id}`);
    load();
  }

  const inputClass = "rounded-lg border border-beige px-2 py-1.5 text-sm";

  return (
    <div>
      <h1 className="text-xl font-semibold text-cocoa mb-4">🎟️ Promo kodlar</h1>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-cocoa/60 block">Kod</label>
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-cocoa/60 block">Foiz (%)</label>
          <input type="number" value={form.percentOff} onChange={(e) => setForm({ ...form, percentOff: e.target.value })} className={`${inputClass} w-20`} />
        </div>
        <div>
          <label className="text-xs text-cocoa/60 block">yoki summa (so'm)</label>
          <input type="number" value={form.amountOff} onChange={(e) => setForm({ ...form, amountOff: e.target.value })} className={`${inputClass} w-28`} />
        </div>
        <div>
          <label className="text-xs text-cocoa/60 block">Min. buyurtma</label>
          <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className={`${inputClass} w-28`} />
        </div>
        <div>
          <label className="text-xs text-cocoa/60 block">Amal qilish muddati</label>
          <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={inputClass} />
        </div>
        <button type="submit" className="bg-chocolate text-cream rounded-lg px-4 py-1.5 text-sm font-medium">Qo'shish</button>
        {error && <div className="text-sm text-red-500 w-full">{error}</div>}
      </form>

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-beige">
        {codes.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium text-cocoa">{c.code}</div>
              <div className="text-xs text-chocolate/60">
                {c.percentOff ? `${c.percentOff}%` : `${c.amountOff?.toLocaleString("uz-UZ")} so'm`}
                {c.minOrderAmount > 0 && ` · min ${c.minOrderAmount.toLocaleString("uz-UZ")} so'm`}
                {c.expiresAt && ` · ${new Date(c.expiresAt).toLocaleDateString("uz-UZ")} gacha`}
                {" · "}ishlatilgan: {c.usageCount}
              </div>
            </div>
            <div className="flex gap-3 text-sm items-center">
              <button onClick={() => toggle(c)} className={c.isActive ? "text-green-600" : "text-cocoa/40"}>
                {c.isActive ? "Faol" : "Nofaol"}
              </button>
              <button onClick={() => remove(c.id)} className="text-red-500">O'chirish</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
