import { Link } from 'react-router-dom';

const WHATSAPP_NUMBER = '919471725271';

const WaIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <path d="m10 15 5-3-5-3z"/>
  </svg>
);

const footerLinks = {
  shop: [
    { label: 'All Products', path: '/shop' },
    { label: 'Customize', path: '/customize' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Bulk Orders', path: '/bulk-orders' },
    { label: 'Corporate Gifts', path: '/bulk-orders' },
  ],
  support: [
    { label: 'Track My Order', path: '/orders' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Shipping Policy', path: '/shipping-policy' },
    { label: 'Return & Refund', path: '/return-refund' },
    { label: 'Contact Us', path: '/contact' },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary border-t-2 border-border" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                <img src="/logo.png" alt="Print My Memory" className="w-full h-full object-contain" loading="lazy" />
              </div>
              <div>
                <div className="font-bold text-[13px] text-text-primary tracking-tight">Print My Memory</div>
                <div className="text-[9px] text-text-muted font-medium tracking-wide mt-0.5">Where Memories Take Shape</div>
              </div>
            </div>

            <p className="text-text-muted text-[13px] leading-relaxed mb-5 max-w-xs">
              Bangalore's favourite studio for 3D printed personalized gifts. We turn your cherished photos into timeless 3D keepsakes.
            </p>

            {/* Social links */}
            <div className="flex gap-2">
              {[
                { label: 'Instagram', href: 'https://www.instagram.com/print.my.memory/', icon: <InstagramIcon /> },
                { label: 'YouTube', href: 'https://youtube.com/@printmymemory', icon: <YouTubeIcon /> },
                { label: 'WhatsApp', href: `https://wa.me/${WHATSAPP_NUMBER}`, icon: <WaIcon /> },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-bg-card border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary hover:border-border transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Shop ── */}
          <div>
            <h4 className="text-text-primary font-semibold text-[13px] mb-5 tracking-wide">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map(item => (
                <li key={item.label}>
                  <Link to={item.path} className="text-text-muted hover:text-text-primary text-[13px] transition-colors duration-150">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <h4 className="text-text-primary font-semibold text-[13px] mb-5 tracking-wide">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map(item => (
                <li key={item.label}>
                  <Link to={item.path} className="text-text-muted hover:text-text-primary text-[13px] transition-colors duration-150">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <h4 className="text-text-primary font-semibold text-[13px] mb-5 tracking-wide">Contact</h4>
            <ul className="space-y-4 mb-6">
              <li>
                <a href="tel:+919471725271" className="flex items-start gap-2.5 text-text-muted hover:text-text-primary transition-colors text-[13px] group">
                  <svg className="shrink-0 mt-0.5 group-hover:text-accent transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  +91-94717-25271
                </a>
              </li>
              <li>
                <a href="mailto:printmymemory120626@gmail.com" className="flex items-start gap-2.5 text-text-muted hover:text-text-primary transition-colors text-[13px] group">
                  <svg className="shrink-0 mt-0.5 group-hover:text-accent transition-colors" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <span className="break-all">printmymemory120626@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-text-muted text-[13px]">
                <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Bangalore, Karnataka, India
              </li>
            </ul>

            {/* Newsletter */}
            <h4 className="text-text-primary font-semibold text-[13px] mb-3 tracking-wide">Stay Updated</h4>
            <form
              className="flex gap-2"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Newsletter subscription"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="input flex-1 text-[13px] py-2.5"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="bg-accent hover:brightness-110 text-white px-4 py-2.5 border-2 border-border text-xs font-bold transition-all shrink-0"
              >
                →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-text-muted text-[12px]">
            © {year} Print My Memory. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-text-muted">
            <Link to="/shipping-policy" className="hover:text-text-primary transition-colors">Shipping</Link>
            <Link to="/return-refund" className="hover:text-text-primary transition-colors">Returns</Link>
            <Link to="/faq" className="hover:text-text-primary transition-colors">FAQ</Link>
          </div>
          <div className="flex items-center gap-2">
            {['GPay', 'PhonePe', 'Paytm', 'UPI', 'VISA', 'MC'].map(m => (
              <span
                key={m}
                className="text-[9px] font-bold text-text-muted bg-bg-card border border-border-subtle px-1.5 py-0.5 rounded"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
