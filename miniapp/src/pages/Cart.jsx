import { useNavigate } from "react-router-dom";
import { useLang } from "../i18n/LangContext";
import { useCart } from "../lib/CartContext";
import TopBar from "../components/TopBar";

export default function Cart() {
  const { t, lang } = useLang();
  const { items, updateQty, removeItem, subtotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="pb-40">
      <TopBar title={t("cart")} />

      {items.length === 0 ? (
        <div className="text-center text-cocoa/50 py-16">{t("emptyCart")}</div>
      ) : (
        <div className="px-4 mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-2xl shadow-sm p-3 flex gap-3">
              <div className="w-16 h-16 bg-beige rounded-xl overflow-hidden shrink-0">
                {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-cocoa truncate">
                  {lang === "ru" ? item.nameRu : item.nameUz}
                </div>
                <div className="text-sm text-chocolate/70 mt-0.5">
                  {item.price.toLocaleString("uz-UZ")} {t("som")}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 bg-beige rounded-full px-2 py-1">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-5">−</button>
                    <span className="w-5 text-center text-sm">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-5">+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-xs text-red-500">
                    {t("remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        // BottomNav bilan ustma-ust tushmasligi uchun uning tepasiga joylashadi
        // (Product sahifasidagi xuddi shu tuzatish bilan bir xil mantiq).
        <div className="fixed left-0 right-0 bg-white border-t border-beige px-4 py-3 z-30"
          style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))" }}>
          <div className="flex justify-between text-sm text-chocolate/70 mb-2">
            <span>{t("subtotal")}</span>
            <span>{subtotal.toLocaleString("uz-UZ")} {t("som")}</span>
          </div>
          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-chocolate text-cream rounded-full py-3 font-medium"
          >
            {t("checkout")}
          </button>
        </div>
      )}
    </div>
  );
}
