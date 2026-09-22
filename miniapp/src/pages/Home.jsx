import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useLang } from "../i18n/LangContext";
import TopBar from "../components/TopBar";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const { t, field } = useLang();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/api/categories"), api.get("/api/products")])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-20">
      <TopBar title={`🍰 ${t("appName")}`} />

      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.id}`}
              className="flex flex-col items-center gap-1 bg-white rounded-2xl px-4 py-3 shrink-0 shadow-sm"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs text-cocoa font-medium whitespace-nowrap">{field(c, "name")}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-4 mt-2">
        <Link
          to="/custom-cake"
          className="block bg-chocolate text-cream rounded-2xl px-4 py-3 my-3 text-center font-medium shadow-sm"
        >
          🎂 {t("customCake")}
        </Link>
      </div>

      {loading ? (
        <div className="text-center text-cocoa/50 py-10">...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 mt-2">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
