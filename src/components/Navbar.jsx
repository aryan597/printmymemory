import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Package } from 'lucide-react';
import { useCart } from '../hooks/useCart';

const WHATSAPP_NUMBER = '919471725271';

const navLinks = [
  { name: 'Shop', path: '/shop' },
  { name: 'Customize', path: '/customize' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'About', path: '/about' },
];

const WaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-bg-primary/85 backdrop-blur-xl border-b border-border-subtle' : 'bg-transparent'
      }`}
    >
      {/* Announcement bar */}
      <div className="announcement-bar bg-bg-secondary/90 backdrop-blur-md border-b border-border-subtle">
        <p className="text-center text-[11.5px] py-1.5 px-4 text-text-secondary">
          Flat ₹50 shipping · Use code <span className="text-accent font-bold tracking-wide">WELCOME10</span> for 10% off your first order
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="Print My Memory - Home">
            <div className="w-9 h-9 overflow-hidden shrink-0 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center">
              <img src="/logo.png" alt="" className="w-full h-full object-contain" loading="eager" decoding="async" />
            </div>
            <span className="hidden sm:block font-bold text-[15px] tracking-tight text-text-primary">Print My Memory</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2" role="menubar">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                role="menuitem"
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`px-3.5 py-2 text-[13.5px] font-medium rounded-lg transition-colors ${
                  isActive(link.path) ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <Link
              to="/orders"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
              aria-label="Track my orders"
            >
              <Package size={18} strokeWidth={1.75} />
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
              aria-label={`Cart${cartCount > 0 ? ` · ${cartCount} items` : ''}`}
            >
              <ShoppingCart size={18} strokeWidth={1.75} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary hidden md:inline-flex !px-4 !py-2 !text-[13px] ml-1"
              aria-label="Order on WhatsApp"
            >
              <WaIcon />
              Order Now
            </a>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-40 bg-bg-primary transition-all duration-300 ease-out ${
          isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ top: '92px' }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="px-4 pt-4 pb-10 flex flex-col gap-1.5 border-t border-border-subtle">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              aria-current={isActive(link.path) ? 'page' : undefined}
              className={`flex items-center px-4 py-3.5 text-base font-medium rounded-xl transition-colors ${
                isActive(link.path) ? 'bg-bg-card text-text-primary' : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full py-3.5 mt-3"
          >
            <WaIcon />
            Order on WhatsApp
          </a>

          <Link to="/orders" className="btn-secondary w-full py-3.5">
            <Package size={16} strokeWidth={1.75} />
            Track My Order
          </Link>
        </div>
      </div>
    </nav>
  );
}
