import { useState, useEffect, useContext, useRef } from 'react';
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-bg-primary/70 backdrop-blur-2xl shadow-lg shadow-black/10 border-b border-glass-border-strong'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-[68px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-accent/25">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-text-primary font-bold text-[15px] leading-tight tracking-tight">Gifted with Love</h1>
              <p className="text-text-muted text-[10px] leading-none tracking-wide">Boutique 3D Prints</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-3 py-2 rounded-full text-[13px] font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-accent bg-accent/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-glass'
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1">
            <a
              href="https://wa.me/917463812249"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-text-secondary hover:text-whatsapp transition-colors px-3 py-2 text-[13px] font-medium"
            >
              <MessageCircle size={16} />
              <span>Chat</span>
            </a>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-glass rounded-full transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
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
                  className="flex items-center gap-1.5 p-1.5 pr-2.5 text-text-secondary hover:text-text-primary hover:bg-glass rounded-full transition-colors"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
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
                      className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-2xl shadow-glass-lg overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-glass-border">
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
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 text-sm transition-colors border-t border-glass-border"
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
                className="ml-1 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-glass rounded-full transition-colors text-sm font-medium"
                aria-label="Sign in"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-glass rounded-full transition-colors ml-1"
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
            className="lg:hidden glass-strong border-t border-glass-border-strong overflow-hidden"
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
              <Link to="/contact" className="block px-4 py-3 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-card transition-colors">
                Contact
              </Link>
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
                    className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
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
