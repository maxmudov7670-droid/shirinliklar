import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const LINKS = [
  { to: "/", label: "📊 Dashboard", end: true },
  { to: "/orders", label: "📦 Buyurtmalar" },
  { to: "/products", label: "🍰 Mahsulotlar" },
  { to: "/categories", label: "🗂️ Kategoriyalar" },
  { to: "/custom-cakes", label: "🎂 Maxsus tortlar" },
  { to: "/promocodes", label: "🎟️ Promo kodlar" },
  { to: "/customers", label: "👥 Mijozlar" },
];

export default function Layout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-cream">
      <aside className="w-56 bg-white border-r border-beige flex flex-col shrink-0">
        <div className="px-4 py-5 text-lg font-semibold text-cocoa">🍰 Shirinliklar</div>
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive ? "bg-chocolate text-cream" : "text-cocoa hover:bg-beige"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="m-3 text-sm text-red-500 text-left px-3 py-2">
          🚪 Chiqish
        </button>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
