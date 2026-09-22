import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useLang } from "../i18n/LangContext";
import { useCart } from "../lib/CartContext";
import { hapticSuccess } from "../lib/telegram";
import TopBar from "../components/TopBar";

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, field } = useLang();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.get(`/api/products/${id}`).then(setProduct);
    api.get("/api/users/favorites").then((favs) => {
      setIsFav(favs.some((f) => f.id === Number(id)));
    }).catch(() => {});
  }, [id]);

  function toggleFav() {
    if (isFav) {
      api.del(`/api/users/favorites/${id}`).then(() => setIsFav(false));
    } else {
      api.post(`/api/users/favorites/${id}`).then(() => setIsFav(true));
    }
  }

  function handleAdd() {
    addItem(product, qty);
    hapticSuccess();
    navigate("/cart");
  }

  if (!product) return null;

  return (
    <div className="pb-24">
      <TopBar title={field(product, "name")} showBack />

      <div className="aspect-square bg-beige">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🍰</div>
        )}
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-semibold text-cocoa">{field(product, "name")}</h2>
          <button onClick={toggleFav} className="text-2xl shrink-0">
            {isFav ? "❤️" : "🤍"}
          </button>
        </div>

        {product.weight && (
          <div className="text-sm text-chocolate/60 mt-1">
            {t("weight")}: {product.weight}
          </div>
        )}

        <div className="text-2xl font-bold text-cocoa mt-2">
          {product.price.toLocaleString("uz-UZ")} {t("som")}
        </div>

        {field(product, "description") && (
          <div className="mt-4">
            <div className="text-sm font-medium text-cocoa mb-1">{t("description")}</div>
            <p className="text-sm text-chocolate/80">{field(product, "description")}</p>
          </div>
        )}

        {field(product, "ingredients") && (
          <div className="mt-4">
            <div className="text-sm font-medium text-cocoa mb-1">{t("ingredients")}</div>
            <p className="text-sm text-chocolate/80">{field(product, "ingredients")}</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-beige px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}>
        <div className="flex items-center gap-3 bg-beige rounded-full px-3 py-1.5">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-lg w-6">−</button>
          <span className="w-5 text-center font-medium">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="text-lg w-6">+</button>
        </div>
        <button
          onClick={handleAdd}
          disabled={!product.isAvailable}
          className="flex-1 bg-chocolate text-cream rounded-full py-3 font-medium disabled:opacity-40"
        >
          {product.isAvailable ? t("addToCart") : t("outOfStock")}
        </button>
      </div>
    </div>
  );
}
