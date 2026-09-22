import { NavLink } from "react-router-dom";
import { useLang } from "../i18n/LangContext";
import { useCart } from "../lib/CartContext";

function Item({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-xs ${
          isActive ? "text-chocolate font-semibold" : "text-cocoa/50"
        }`
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}

export default function BottomNav() {
  const { t } = useLang();
  const { count } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-beige flex items-stretch z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <Item to="/" icon="🏠" label={t("home")} />
      <Item to="/custom-cake" icon="🎂" label={t("customCake")} />
      <div className="relative flex-1">
        <Item to="/cart" icon="🛒" label={t("cart")} />
        {count > 0 && (
          <span className="absolute top-1 right-1/4 bg-chocolate text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {count}
          </span>
        )}
      </div>
      <Item to="/profile" icon="👤" label={t("profile")} />
    </nav>
  );
}
