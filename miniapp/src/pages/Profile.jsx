import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useLang } from "../i18n/LangContext";
import { getTelegramUser } from "../lib/telegram";
import TopBar from "../components/TopBar";

const TABS = ["orders", "favorites", "addresses"];

export default function Profile() {
  const { t, lang, field } = useLang();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const tgUser = getTelegramUser();

  useEffect(() => {
    if (!tgUser?.id) return;
    if (tab === "orders") api.get(`/api/orders/user/${tgUser.id}`).then(setOrders).catch(() => {});
    if (tab === "favorites") api.get("/api/users/favorites").then(setFavorites).catch(() => {});
    if (tab === "addresses") api.get("/api/users/addresses").then(setAddresses).catch(() => {});
  }, [tab]);

  function removeAddress(id) {
    api.del(`/api/users/addresses/${id}`).then(() => setAddresses((a) => a.filter((x) => x.id !== id)));
  }

  return (
    <div className="pb-20">
      <TopBar title={t("profile")} />

      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-beige flex items-center justify-center text-2xl">👤</div>
          <div>
            <div className="font-medium text-cocoa">{tgUser?.first_name || "—"}</div>
            {tgUser?.username && <div className="text-xs text-chocolate/50">@{tgUser.username}</div>}
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {TABS.map((tb) => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`flex-1 rounded-full py-2 text-xs font-medium ${
                tab === tb ? "bg-chocolate text-cream" : "bg-beige text-cocoa"
              }`}
            >
              {t(tb === "orders" ? "myOrders" : tb === "favorites" ? "favorites" : "savedAddresses")}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {tab === "orders" &&
            (orders.length === 0 ? (
              <div className="text-center text-cocoa/50 py-10">{t("noOrders")}</div>
            ) : (
              orders.map((o) => (
                <div key={o.id} className="bg-white rounded-2xl shadow-sm p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-cocoa">#{o.id}</span>
                    <span className="text-xs bg-beige text-cocoa px-2 py-1 rounded-full">
                      {lang === "ru" ? o.statusLabelRu : o.statusLabelUz}
                    </span>
                  </div>
                  <div className="text-sm text-chocolate/70 mt-1">
                    {o.isCustomCake
                      ? `🎂 ${o.cake?.type || ""}`
                      : (o.items || []).map((i) => i.name).join(", ")}
                  </div>
                  <div className="text-sm font-semibold text-cocoa mt-1">
                    {o.totalPrice ? `${o.totalPrice.toLocaleString("uz-UZ")} ${t("som")}` : t("priceOnRequest")}
                  </div>
                </div>
              ))
            ))}

          {tab === "favorites" &&
            (favorites.length === 0 ? (
              <div className="text-center text-cocoa/50 py-10">{t("noFavorites")}</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {favorites.map((p) => (
                  <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="aspect-square bg-beige">
                      {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="p-2 text-sm text-cocoa truncate">{field(p, "name")}</div>
                  </Link>
                ))}
              </div>
            ))}

          {tab === "addresses" &&
            (addresses.length === 0 ? (
              <div className="text-center text-cocoa/50 py-10">—</div>
            ) : (
              addresses.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl shadow-sm p-3 flex justify-between items-start gap-2">
                  <div>
                    {a.label && <div className="text-xs text-chocolate/50">{a.label}</div>}
                    <div className="text-sm text-cocoa">{a.address}</div>
                  </div>
                  <button onClick={() => removeAddress(a.id)} className="text-xs text-red-500 shrink-0">
                    {t("remove")}
                  </button>
                </div>
              ))
            ))}
        </div>
      </div>
    </div>
  );
}
