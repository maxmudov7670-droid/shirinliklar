import { Link } from "react-router-dom";
import { useLang } from "../i18n/LangContext";

export default function ProductCard({ product }) {
  const { t, field } = useLang();
  return (
    <Link
      to={`/product/${product.id}`}
      className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col active:scale-[0.98] transition"
    >
      <div className="aspect-square bg-beige overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍰</div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <div className="text-sm font-medium text-cocoa line-clamp-2">{field(product, "name")}</div>
        {product.weight && <div className="text-xs text-chocolate/60">{product.weight}</div>}
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="font-semibold text-cocoa">
            {product.price.toLocaleString("uz-UZ")} {t("som")}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-chocolate/40 line-through">
              {product.oldPrice.toLocaleString("uz-UZ")}
            </span>
          )}
        </div>
        {!product.isAvailable && (
          <span className="text-xs text-red-500">{t("outOfStock")}</span>
        )}
      </div>
    </Link>
  );
}
