
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Checkout from './pages/Checkout';
import WhatsAppFAB from './components/WhatsAppFAB';
import { AuthProvider } from './context/AuthContext';
import { AlertConfirmProvider } from './context/AlertConfirmContext';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';

function App() {
  return (
    <AuthProvider>
      <AlertConfirmProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen relative font-sans text-gray-800">
              <Navbar />
              <CartDrawer />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Routes>
              </main>
              <Footer />
              <WhatsAppFAB />
            </div>
          </Router>
        </CartProvider>
      </AlertConfirmProvider>
    </AuthProvider>
  );
}

export default App;
