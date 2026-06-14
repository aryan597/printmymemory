import { Link } from 'react-router-dom';

// Payment logos as inline SVGs
function GPayLogo() {
  return (
    <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.6 8.2c0-.6-.1-1.2-.2-1.7h-5.6v3.2h3.2c-.1.9-.7 1.6-1.7 2.1v1.8h2.7c1.6-1.5 2.5-3.7 2.5-6.3h-.9z" fill="#fff"/>
      <path d="M13.8 16c2.3 0 4.2-.8 5.6-2.1l-2.7-1.8c-.8.5-1.8.9-2.9.9-2.2 0-4.1-1.5-4.8-3.5H6.1v1.9C7.5 13.8 10.4 16 13.8 16z" fill="#fff"/>
      <path d="M9 9.5c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V4.2H6.1C5.4 5.5 5 6.9 5 8.3s.4 2.8 1.1 4.1l2.3-1.8-.4-.1z" fill="#fff"/>
      <path d="M13.8 3.1c1.2 0 2.3.4 3.2 1.2l2.4-2.4C17.9 1 16 0 13.8 0 10.4 0 7.5 2.2 6.1 5.1l2.9 1.9c.7-2 2.6-3.9 4.8-3.9z" fill="#fff"/>
    </svg>
  );
}

function PhonePeLogo() {
  return (
    <svg width="60" height="16" viewBox="0 0 60 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial">PhonePe</text>
    </svg>
  );
}

function PaytmLogo() {
  return (
    <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial">Paytm</text>
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg width="40" height="16" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" fill="#fff" fontSize="11" fontWeight="bold" fontFamily="Arial" fontStyle="italic">VISA</text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="7" fill="#eb001b"/>
      <circle cx="16" cy="8" r="7" fill="#f79e1b"/>
      <path d="M12 2.5a7 7 0 0 0 0 11 7 7 0 0 0 0-11z" fill="#ff5f00"/>
    </svg>
  );
}

function RazorpayLogo() {
  return (
    <svg width="60" height="16" viewBox="0 0 60 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="12" fill="#fff" fontSize="10" fontWeight="bold" fontFamily="Arial">Razorpay</text>
    </svg>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border-subtle bg-bg-secondary" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-transparent">
                <img
                  src="/logo.png"
                  alt="Print My Memory"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm tracking-tight leading-tight">Print My Memory</span>
                <span className="text-[9px] text-text-muted leading-tight">Where Memories Take Shape</span>
              </div>
            </div>
            <p className="text-text-muted text-xs leading-relaxed mb-4">
              We create personalized 3D printed gifts that capture your most precious memories and turn them into timeless keepsakes.
            </p>
            <div className="flex gap-2">
              {[
                { label: 'Instagram', href: 'https://www.instagram.com/print.my.memory/' },
                { label: 'YouTube', href: 'https://youtube.com/@printmymemory' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center text-text-muted hover:text-white hover:border-border transition-colors"
                  aria-label={social.label}
                >
                  {social.label === 'Instagram' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                      <path d="m10 15 5-3-5-3z"/>
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Home', path: '/' },
                { name: 'Shop', path: '/shop' },
                { name: 'Customize', path: '/customize' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact Us', path: '/contact' },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className="text-text-muted hover:text-white transition-colors text-xs">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Customer Service</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Track Order', path: '/orders' },
                { label: 'Shipping Policy', path: '/shipping-policy' },
                { label: 'Return & Refund', path: '/return-refund' },
                { label: "FAQ's", path: '/faq' },
                { label: 'Bulk Orders', path: '/bulk-orders' },
                { label: 'Corporate Gifts', path: '/bulk-orders' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-text-muted hover:text-white transition-colors text-xs">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-text-muted text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <a href="tel:+919471725271" className="hover:text-white transition-colors">+91-94717-25271</a>
              </li>
              <li className="flex items-center gap-2 text-text-muted text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
                <a href="mailto:printmymemory120626@gmail.com" className="hover:text-white transition-colors">printmymemory120626@gmail.com</a>
              </li>
              <li className="flex items-start gap-2 text-text-muted text-xs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>Bangalore, India</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-medium mb-4 text-sm">Newsletter</h4>
            <p className="text-text-muted text-xs mb-3">Subscribe to get updates on new products and offers.</p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-bg-card border border-border-subtle rounded-lg px-3 py-2 text-xs text-white placeholder:text-text-muted focus:outline-none focus:border-brand-orange"
              />
              <button
                type="submit"
                className="bg-brand-orange text-white px-4 py-2 rounded-lg text-xs font-medium hover:brightness-110 transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-xs">
              &copy; {currentYear} Print My Memory. All Rights Reserved.
            </p>
            {/* Payment logos */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5" title="Google Pay">
                <GPayLogo />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5" title="PhonePe">
                <PhonePeLogo />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5" title="Paytm">
                <PaytmLogo />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5" title="VISA">
                <VisaLogo />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5" title="Mastercard">
                <MastercardLogo />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5" title="Razorpay">
                <RazorpayLogo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
