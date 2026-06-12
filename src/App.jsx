import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Customize from './pages/Customize';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Community from './pages/Community';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnRefund from './pages/ReturnRefund';
import FAQ from './pages/FAQ';
import BulkOrders from './pages/BulkOrders';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
          <AnnouncementBar />
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/customize" element={<Customize />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:id" element={<OrderDetail />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/community" element={<Community />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/return-refund" element={<ReturnRefund />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/bulk-orders" element={<BulkOrders />} />
            </Routes>
          </div>
          <Footer />
          <WhatsAppButton />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#141414',
                color: '#fafafa',
                border: '1px solid #262626',
                borderRadius: '12px',
              },
            }}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
