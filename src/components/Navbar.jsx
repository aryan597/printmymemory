import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, MessageCircle, LogOut, Package, Heart, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Customize', path: '/customize' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Community', path: '/community' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, signOut } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-bg-primary/90 backdrop-blur-xl shadow-lg shadow-black/20 border-b border-border-subtle'
          : 'bg-bg-primary'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-text-primary font-bold text-[15px] leading-tight tracking-tight">PrintMyMemory</h1>
              <p className="text-text-muted text-[10px] leading-none tracking-wide">Crafted by us. Gifted by you.</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-text-secondary hover:text-whatsapp transition-colors px-3 py-2"
            >
              <MessageCircle size={17} />
              <span className="text-[13px] font-medium">WhatsApp</span>
            </a>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-card rounded-lg transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </motion.span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1.5 pr-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-card rounded-lg transition-colors"
                >
                  <div className="w-7 h-7 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent text-xs font-bold">
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
                      className="absolute right-0 top-full mt-2 w-52 bg-bg-card border border-border-subtle rounded-xl shadow-xl shadow-black/30 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-border-subtle">
                        <p className="text-text-primary text-sm font-medium truncate">{user?.user_metadata?.full_name || user?.email}</p>
                        <p className="text-text-muted text-xs truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-elevated text-sm transition-colors">
                        <User size={15} /> My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-2.5 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-elevated text-sm transition-colors">
                        <Package size={15} /> My Orders
                      </Link>
                      <Link to="/community" className="flex items-center gap-2.5 px-3 py-2.5 text-text-secondary hover:text-text-primary hover:bg-bg-elevated text-sm transition-colors">
                        <Heart size={15} /> Community
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 text-sm transition-colors border-t border-border-subtle"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="ml-1 p-2 text-text-secondary hover:text-text-primary hover:bg-bg-card rounded-lg transition-colors"
              >
                <User size={20} />
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-bg-card rounded-lg transition-colors ml-1"
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
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-accent bg-accent/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-card'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link to="/profile" className="block px-4 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors">
                    My Profile
                  </Link>
                  <Link to="/orders" className="block px-4 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors">
                    My Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="block px-4 py-3 rounded-lg text-sm text-accent bg-accent/10 font-medium">
                  Sign In / Sign Up
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
