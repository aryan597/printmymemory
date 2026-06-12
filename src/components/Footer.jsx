import { useState } from 'react';
import { Mail, Phone, MapPin, Globe, Share2, Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNewsletter } from '../hooks/useNewsletter';

function PaymentBadge({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium tracking-wide border border-border-subtle text-text-muted">
      {label}
    </span>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const { subscribe, subscribing } = useNewsletter();
  const currentYear = new Date().getFullYear();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const result = await subscribe(email);
    if (result.success) setEmail('');
  };

  const socialLinks = [
    { icon: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>, label: 'Instagram', href: 'https://instagram.com/printmymemory.in' },
    { icon: Globe, label: 'Website', href: '/' },
    { icon: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>, label: 'YouTube', href: 'https://youtube.com/@printmymemory' },
  ];

  return (
    <footer className="border-t border-border-subtle bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
                <span className="font-bold text-sm">PM</span>
              </div>
              <span className="text-text-primary font-semibold text-base tracking-tight">PrintMyMemory</span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Premium 3D printed keepsakes. We turn your favorite photos into tangible objects you can hold, gift, and keep forever.
            </p>
            <div className="flex gap-2.5 mt-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="w-9 h-9 rounded-lg border border-border-subtle flex items-center justify-center text-text-secondary hover:text-white hover:border-text-secondary transition-colors"
                  aria-label={social.label}
                >
                  {typeof social.icon === 'function' ? <social.icon /> : <social.icon size={15} />}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-text-primary font-medium mb-4 text-sm">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'All Products', path: '/shop' },
                { name: 'Customize', path: '/customize' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'Bulk Orders', path: '/bulk-orders' },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-text-secondary hover:text-white transition-colors text-sm">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-text-primary font-medium mb-4 text-sm">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', path: '/about' },
                { label: 'Shipping Policy', path: '/shipping-policy' },
                { label: 'Return & Refund', path: '/return-refund' },
                { label: 'FAQ', path: '/faq' },
                { label: 'Contact', path: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-text-secondary hover:text-white transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="text-text-primary font-medium mb-4 text-sm">Contact</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-2.5 text-text-secondary text-sm">
                <Phone size={14} className="text-text-muted shrink-0" />
                <a href="tel:+917463812249" className="hover:text-white transition-colors">+91-7463812249</a>
              </li>
              <li className="flex items-center gap-2.5 text-text-secondary text-sm">
                <Mail size={14} className="text-text-muted shrink-0" />
                <a href="mailto:hello@printmymemory.in" className="hover:text-white transition-colors">hello@printmymemory.in</a>
              </li>
              <li className="flex items-start gap-2.5 text-text-secondary text-sm">
                <MapPin size={14} className="text-text-muted shrink-0 mt-0.5" />
                <span>Bangalore, India</span>
              </li>
            </ul>

            <h4 className="text-text-primary font-medium mb-3 text-sm">Newsletter</h4>
            <p className="text-text-muted text-xs mb-3">New drops and offers. No spam.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribing}
                className="flex-1 input rounded-lg text-sm"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="bg-white text-black hover:bg-neutral-200 disabled:opacity-60 px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 flex items-center gap-1.5"
              >
                {subscribing ? <Loader2 size={14} className="animate-spin" /> : null}
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-xs flex items-center gap-1">
              &copy; {currentYear} PrintMyMemory. Made with <Heart size={10} className="text-text-secondary fill-text-secondary" /> in India.
            </p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <PaymentBadge label="UPI" />
              <PaymentBadge label="Cards" />
              <PaymentBadge label="Netbanking" />
              <PaymentBadge label="Razorpay" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
