import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./lib/AuthContext";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import CustomCakes from "./pages/CustomCakes";
import PromoCodes from "./pages/PromoCodes";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";

export default function App() {
  const { authed } = useAuth();

  if (!authed) return <Login />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/custom-cakes" element={<CustomCakes />} />
        <Route path="/promocodes" element={<PromoCodes />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
