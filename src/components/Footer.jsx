import { Mail, Phone, MapPin, Globe, Video, Share2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-bg-secondary border-t border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <div>
                <h3 className="text-text-primary font-bold text-lg leading-tight">PrintMyMemory</h3>
                <p className="text-text-muted text-xs">3D Printed. Forever Yours.</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm mt-3 leading-relaxed">
              We create personalized 3D printed gifts that capture your most precious memories and turn them into timeless keepsakes.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors">
                <Globe size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors">
                <Share2 size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors">
                <Video size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {['Home', 'Shop', 'Customize', 'Gallery', 'About Us', 'Contact Us'].map((item) => (
                <li key={item}>
                  <a href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-text-secondary hover:text-accent transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2.5">
              {['Track Order', 'Shipping Policy', 'Return & Refund', "FAQ's", 'Bulk Orders', 'Corporate Gifts'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-text-secondary hover:text-accent transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us + Newsletter */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2 text-text-secondary text-sm">
                <Phone size={14} className="text-accent shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 text-text-secondary text-sm">
                <Mail size={14} className="text-accent shrink-0" />
                <span>hello@printmymemory.in</span>
              </li>
              <li className="flex items-start gap-2 text-text-secondary text-sm">
                <MapPin size={14} className="text-accent shrink-0 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>

            <h4 className="text-text-primary font-semibold mb-3">Newsletter</h4>
            <p className="text-text-secondary text-xs mb-3">Subscribe to get updates on new products and offers.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-xs">© 2024 PrintMyMemory. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-xs bg-bg-card px-2 py-1 rounded">G Pay</span>
            <span className="text-text-muted text-xs bg-bg-card px-2 py-1 rounded">PhonePe</span>
            <span className="text-text-muted text-xs bg-bg-card px-2 py-1 rounded">Paytm</span>
            <span className="text-text-muted text-xs bg-bg-card px-2 py-1 rounded">VISA</span>
            <span className="text-text-muted text-xs bg-bg-card px-2 py-1 rounded">MC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
