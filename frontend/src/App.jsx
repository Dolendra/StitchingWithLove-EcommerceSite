import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProtectedRoute, AdminRoute, GuestRoute } from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import BookAppointment from "./pages/BookAppointment";
import CustomTailoring from "./pages/CustomTailoring";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Measurements from "./pages/Measurements";
import Wishlist from "./pages/Wishlist";
import TryOn from "./pages/TryOn";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/book" element={<BookAppointment />} />
                  <Route path="/custom" element={<CustomTailoring />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/cancel" element={<PaymentCancel />} />
                  <Route path="/tryon" element={<TryOn />} />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <ProtectedRoute>
                        <OrderDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <GuestRoute>
                        <Login />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <GuestRoute>
                        <Register />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/user" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                  <Route
                    path="/measurements"
                    element={
                      <ProtectedRoute>
                        <Measurements />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
