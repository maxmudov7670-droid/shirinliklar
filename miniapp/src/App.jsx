import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { initTelegram, getTelegramUser } from "./lib/telegram";
import { api } from "./lib/api";
import { useLang } from "./i18n/LangContext";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import Category from "./pages/Category";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CustomCake from "./pages/CustomCake";
import Profile from "./pages/Profile";
import OrderSuccess from "./pages/OrderSuccess";

export default function App() {
  const location = useLocation();
  const { lang } = useLang();

  useEffect(() => {
    initTelegram();
    if (getTelegramUser()) {
      api.post("/api/users/sync", { languageCode: lang }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const hideNav = location.pathname.startsWith("/order-success");

  return (
    <div className="min-h-screen bg-cream">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:id" element={<Category />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/custom-cake" element={<CustomCake />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
}
