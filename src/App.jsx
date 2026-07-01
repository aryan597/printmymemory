import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
// Lazy-load Three.js-heavy pages so they don't bloat the initial bundle
const Customize = lazy(() => import('./pages/Customize'));
import Gallery from './pages/Gallery';
import About from './pages/About';
import Reviews from './pages/Reviews';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Community from './pages/Community';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnRefund from './pages/ReturnRefund';
import FAQ from './pages/FAQ';
import BulkOrders from './pages/BulkOrders';
import Receipt from './pages/Receipt';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
          {/* Skip to content link for accessibility */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <ErrorBoundary>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                </div>
              }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/customize" element={<Customize />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/about" element={<About />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                <Route path="/community" element={<Community />} />
                <Route path="/shipping-policy" element={<ShippingPolicy />} />
                <Route path="/return-refund" element={<ReturnRefund />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/bulk-orders" element={<BulkOrders />} />
                <Route path="/receipt" element={<Receipt />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
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
