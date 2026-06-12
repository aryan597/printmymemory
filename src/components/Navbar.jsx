import { useState, useEffect, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, MessageCircle, LogOut, Package, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

const navLinks = [
  { name: 'Shop', path: '/shop' },
  { name: 'Customize', path: '/customize' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'About', path: '/about' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showUserMenu]);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        isScrolled ? 'bg-bg-primary/95 backdrop-blur-md border-border-subtle' : 'bg-bg-primary border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">PM</span>
            </div>
            <span className="text-text-primary font-semibold text-base tracking-tight">PrintMyMemory</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-white'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            <a
              href="https://wa.me/917463812249"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-text-secondary hover:text-whatsapp transition-colors px-3 py-2 text-sm font-medium"
            >
              <MessageCircle size={16} />
              <span>Chat</span>
            </a>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-text-secondary hover:text-white transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-white text-black text-[10px] font-semibold rounded-full flex items-center justify-center px-1"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative ml-1" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1.5 pr-2.5 text-text-secondary hover:text-white rounded-lg transition-colors"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 bg-surface border border-border-subtle rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {(user?.user_metadata?.full_name || user?.email)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-bg-secondary border border-border-subtle rounded-xl shadow-soft-lg overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-border-subtle">
                        <p className="text-text-primary text-sm font-medium truncate">{user?.user_metadata?.full_name || user?.email}</p>
                        <p className="text-text-muted text-xs truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2.5 text-text-secondary hover:text-white hover:bg-surface-hover text-sm transition-colors">
                        <User size={15} /> My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-2.5 px-3 py-2.5 text-text-secondary hover:text-white hover:bg-surface-hover text-sm transition-colors">
                        <Package size={15} /> My Orders
                      </Link>
                      <Link to="/community" className="flex items-center gap-2.5 px-3 py-2.5 text-text-secondary hover:text-white hover:bg-surface-hover text-sm transition-colors">
                        <Heart size={15} /> Community
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-text-secondary hover:text-white hover:bg-surface-hover text-sm transition-colors border-t border-border-subtle"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : null}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-white transition-colors ml-1"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-bg-secondary border-t border-border-subtle overflow-hidden"
          >
            <div className="px-4 py-3 space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === link.path ? 'text-white' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/contact" className="block px-4 py-3 text-sm text-text-secondary hover:text-white transition-colors">
                Contact
              </Link>
              <Link to="/cart" className="block px-4 py-3 text-sm text-text-secondary hover:text-white transition-colors">
                Cart ({cartCount})
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
