import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Alohida /api/customers endpoint o'rniga buyurtmalardan noyob mijozlarni
// chiqarib beramiz — bu MVP uchun yetarli va backend'ga yangi route qo'shishni talab qilmaydi.
export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get("/api/orders").then((orders) => {
      const map = new Map();
      for (const o of orders) {
        const key = o.customerPhone + o.customerName;
        if (!map.has(key)) {
          map.set(key, { name: o.customerName, phone: o.customerPhone, username: o.customerUsername, orders: 0, total: 0 });
        }
        const c = map.get(key);
        c.orders += 1;
        c.total += o.totalPrice || 0;
      }
      setCustomers([...map.values()].sort((a, b) => b.orders - a.orders));
    });
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-cocoa mb-4">👥 Mijozlar</h1>
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-beige">
        {customers.length === 0 && <div className="px-4 py-6 text-sm text-cocoa/50">Hali mijozlar yo'q</div>}
        {customers.map((c, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium text-cocoa">{c.name}</div>
              <div className="text-xs text-chocolate/60">{c.phone} {c.username && `· @${c.username}`}</div>
            </div>
            <div className="text-right text-sm">
              <div className="text-cocoa font-medium">{c.orders} buyurtma</div>
              <div className="text-xs text-chocolate/50">{c.total.toLocaleString("uz-UZ")} so'm</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
