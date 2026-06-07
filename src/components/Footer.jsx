import { Mail, Phone, MapPin, Globe, Video, Share2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h3 className="text-text-primary font-bold text-base leading-tight">PrintMyMemory</h3>
                <p className="text-text-muted text-[10px] tracking-wide">Crafted by us. Gifted by you.</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              We create personalized 3D printed gifts that capture your most precious memories and turn them into timeless keepsakes.
            </p>
            <div className="flex gap-2.5 mt-5">
              {[
                { icon: Globe, label: 'Website' },
                { icon: Share2, label: 'Social' },
                { icon: Video, label: 'YouTube' },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="w-9 h-9 rounded-full bg-bg-card flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
                { name: 'Customize', path: '/customize' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'Community', path: '/community' },
                { name: 'About Us', path: '/about' },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-text-secondary hover:text-accent transition-colors text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4 text-sm">Customer Service</h4>
            <ul className="space-y-2.5">
              {['Track Order', 'Shipping Policy', 'Return & Refund', "FAQ's", 'Bulk Orders', 'Corporate Gifts'].map((item) => (
                <li key={item}>
                  <Link to="/contact" className="text-text-secondary hover:text-accent transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4 text-sm">Contact Us</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2.5 text-text-secondary text-sm">
                <Phone size={14} className="text-accent shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5 text-text-secondary text-sm">
                <Mail size={14} className="text-accent shrink-0" />
                <span>hello@printmymemory.in</span>
              </li>
              <li className="flex items-start gap-2.5 text-text-secondary text-sm">
                <MapPin size={14} className="text-accent shrink-0 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>

            <h4 className="text-text-primary font-semibold mb-3 text-sm">Newsletter</h4>
            <p className="text-text-secondary text-xs mb-3">Subscribe for new products and exclusive offers.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thanks for subscribing!');
              }}
              className="flex gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button type="submit" className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-xs flex items-center gap-1">
            © 2024 PrintMyMemory. Made with <Heart size={10} className="text-accent fill-accent" /> in India.
          </p>
          <div className="flex items-center gap-2">
            {['G Pay', 'PhonePe', 'Paytm', 'VISA', 'Mastercard'].map((method) => (
              <span key={method} className="text-text-muted text-[10px] bg-bg-card px-2 py-1 rounded border border-border-subtle">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
