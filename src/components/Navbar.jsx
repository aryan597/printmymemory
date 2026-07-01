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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-bg-primary/95 backdrop-blur-2xl border-b border-border-subtle shadow-xl shadow-black/40'
          : 'bg-transparent'
      }`}
    >
      {/* Announcement bar */}
      <div className="bg-accent announcement-bar">
        <div className="text-center py-2 px-4">
          <span className="text-[11px] sm:text-xs font-semibold text-white tracking-wide">
            🎁 Use code <span className="underline underline-offset-2">WELCOME10</span> for 10% off your first order
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[62px]">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="Print My Memory - Home"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt=""
                className="w-full h-full object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-bold text-[13px] tracking-tight text-white group-hover:text-accent transition-colors duration-200">Print My Memory</span>
              <span className="text-[9px] text-text-muted font-medium tracking-wide">Bangalore · Handcrafted 3D Gifts</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center" role="menubar">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                role="menuitem"
                aria-current={isActive(link.path) ? 'page' : undefined}
                className={`px-4 py-2 mx-0.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-white bg-white/8'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white text-[12px] font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-900/25"
              aria-label="Order on WhatsApp"
            >
              <WaIcon />
              Order Now
            </a>

            {/* Track orders */}
            <Link
              to="/orders"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all duration-200"
              aria-label="Track my orders"
            >
              <Package size={17} strokeWidth={1.8} />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all duration-200"
              aria-label={`Cart${cartCount > 0 ? ` · ${cartCount} items` : ''}`}
            >
              <ShoppingCart size={17} strokeWidth={1.8} />
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

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-all duration-200"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-40 bg-bg-primary transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ top: '96px' }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="px-4 pt-2 pb-10 flex flex-col gap-1 border-t border-border-subtle">
          {navLinks.map((link, i) => (
            <Link
              key={link.name}
              to={link.path}
              aria-current={isActive(link.path) ? 'page' : undefined}
              className={`flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {link.name}
            </Link>
          ))}

          {/* Divider */}
          <div className="my-3 border-t border-border-subtle" />

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-colors"
          >
            <WaIcon />
            Order on WhatsApp
          </a>

          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-border text-text-secondary hover:text-white hover:border-border-strong font-medium text-sm transition-colors"
          >
            <Package size={15} strokeWidth={1.8} />
            Track My Order
          </Link>
        </div>
      </div>
    </nav>
  );
}
