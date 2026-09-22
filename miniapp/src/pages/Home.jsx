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
        <img
          src="https://i.ibb.co/mFVkCCGS/shirinliklar-start-logo.jpg"
          alt="Shirinliklar dunyosi"
          className="w-full rounded-2xl shadow-sm object-cover mb-1"
        />
      </div>

      <div className="pt-4">
        <div className="flex gap-3 overflow-x-auto pb-2 px-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.id}`}
              className="relative shrink-0 w-28 h-32 rounded-2xl overflow-hidden shadow-sm bg-beige"
            >
              {c.image ? (
                <img
                  src={c.image}
                  alt={field(c, "name")}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-4xl">{c.emoji}</div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent px-2 pt-6 pb-2">
                <span className="text-xs text-white font-medium leading-tight">{field(c, "name")}</span>
              </div>
            </Link>
          ))}
        </div>
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
