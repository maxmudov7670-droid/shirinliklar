import { useEffect, useState } from "react";
import { api } from "../lib/api";

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-semibold text-cocoa mt-1">{value}</div>
      <div className="text-xs text-chocolate/60 mt-0.5">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/api/reports/dashboard").then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="text-cocoa/50">Yuklanmoqda...</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold text-cocoa mb-4">📊 Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="📦" label="Bugungi buyurtmalar" value={stats.todayOrders} />
        <StatCard icon="💰" label="Bugungi tushum" value={`${stats.todayRevenue.toLocaleString("uz-UZ")} so'm`} />
        <StatCard icon="👥" label="Mijozlar" value={stats.totalCustomers} />
        <StatCard icon="🎂" label="Narxlanishi kerak tortlar" value={stats.pendingCakeOrders} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 mt-6">
        <h2 className="text-sm font-semibold text-cocoa mb-3">🏆 Eng ko'p sotilgan mahsulotlar</h2>
        {stats.topProducts.length === 0 ? (
          <div className="text-sm text-cocoa/40">Hali ma'lumot yo'q</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.topProducts.map((p, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-cocoa">{i + 1}. {p.name}</span>
                <span className="text-chocolate/60">{p.qty} dona</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
