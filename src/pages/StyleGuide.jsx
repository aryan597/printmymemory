/**
 * /style — living style guide for the Tactile Brutalist Minimalism system.
 * Preview surface for the revamp (docs/ui-revamp-prd.md). Not linked in nav.
 */
import { ShoppingCart, Box, Layers, Sparkles, Ruler, Clock, Check } from 'lucide-react';
import TactileButton from '../components/ui/tactile/TactileButton';
import ThemeToggle from '../components/ui/tactile/ThemeToggle';
import { SpecimenCard, StickerBadge, SpecChip, Tag, TactileInput } from '../components/ui/tactile/primitives';

const WaIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function Section({ label, title, children }) {
  return (
    <section className="mb-14">
      <div className="flex items-center gap-3 mb-5">
        <Tag>{label}</Tag>
        <h2 className="text-lg font-black uppercase tracking-tight" style={{ color: 'var(--tb-ink)' }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

const SWATCHES = [
  ['--tb-paper', 'Paper'], ['--tb-surface', 'Surface'], ['--tb-surface-2', 'Surface 2'],
  ['--tb-ink', 'Ink'], ['--tb-ink-soft', 'Ink soft'], ['--tb-orange', 'Orange'], ['--tb-wa', 'WhatsApp'],
];

export default function StyleGuide() {
  return (
    <div className="tb-canvas min-h-screen" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-28 pb-24">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-12">
          <div>
            <Tag className="mb-4">Design System · v1</Tag>
            <h1 className="font-black uppercase leading-[0.92] tracking-tight"
                style={{ color: 'var(--tb-ink)', fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
              Tactile<br />Brutalist<br />Minimalism
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed" style={{ color: 'var(--tb-ink-soft)' }}>
              The interface should feel like the product — something you can pick up, press, and put on a shelf.
              Hard edges. Honest structure. One loud note of orange.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Color */}
        <Section label="01 / Color" title="Ink & Paper">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SWATCHES.map(([varName, name]) => (
              <div key={varName} className="tb-card tb-shadow-sm overflow-hidden">
                <div className="h-20" style={{ background: `var(${varName})` }} />
                <div className="px-3 py-2 border-t-2" style={{ borderColor: 'var(--tb-ink)' }}>
                  <p className="text-xs font-bold" style={{ color: 'var(--tb-ink)' }}>{name}</p>
                  <p className="font-mono-tb text-[10px]" style={{ color: 'var(--tb-ink-faint)' }}>{varName}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Buttons */}
        <Section label="02 / Actions" title="Press me">
          <p className="text-xs mb-4 font-mono-tb" style={{ color: 'var(--tb-ink-soft)' }}>
            // hover lifts · active collapses the shadow — the tactile press
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <TactileButton variant="primary"><ShoppingCart size={15} /> Add to Cart</TactileButton>
            <TactileButton variant="secondary">View Details</TactileButton>
            <TactileButton variant="wa"><WaIcon /> Order on WhatsApp</TactileButton>
            <TactileButton variant="secondary" disabled>Sold Out</TactileButton>
            <TactileButton variant="ghost">Read more</TactileButton>
          </div>
        </Section>

        {/* Badges + chips */}
        <Section label="03 / Labels" title="Stickers & spec chips">
          <div className="flex flex-wrap gap-3 mb-5">
            <StickerBadge tone="orange"><Sparkles size={11} /> Custom</StickerBadge>
            <StickerBadge tone="ink"><Layers size={11} /> Multi-Color</StickerBadge>
            <StickerBadge>Bestseller</StickerBadge>
            <StickerBadge>Only 3 left</StickerBadge>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <SpecChip>PLA Matte</SpecChip>
            <SpecChip>120 g</SpecChip>
            <SpecChip><Clock size={11} /> ~6 hrs</SpecChip>
            <SpecChip><Ruler size={11} /> 100mm</SpecChip>
          </div>
        </Section>

        {/* Inputs */}
        <Section label="04 / Forms" title="Inputs">
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl">
            <TactileInput placeholder="Full name" />
            <TactileInput placeholder="Phone" />
            <div className="sm:col-span-2">
              <TactileInput placeholder="Engraving text (focus me)" />
            </div>
          </div>
        </Section>

        {/* Specimen product card */}
        <Section label="05 / Commerce" title="Product specimen card">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 max-w-2xl">
            {[
              { name: 'Face Miniature', price: '₹1,299', badge: 'orange', badgeText: 'Custom' },
              { name: 'Lithophane Lamp', price: '₹1,899', badge: 'ink', badgeText: 'Multi-Color' },
              { name: 'Photo Keychain', price: '₹349', badge: null },
            ].map((p) => (
              <SpecimenCard key={p.name} pressable className="overflow-hidden">
                <div className="relative aspect-[4/5]" style={{ background: 'var(--tb-surface-2)' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Box size={40} strokeWidth={1.4} style={{ color: 'var(--tb-ink-faint)' }} />
                  </div>
                  {p.badge && (
                    <div className="absolute top-2 left-2">
                      <StickerBadge tone={p.badge}>{p.badgeText}</StickerBadge>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5 border-t-2" style={{ borderColor: 'var(--tb-ink)' }}>
                  <p className="text-[13px] font-bold leading-tight" style={{ color: 'var(--tb-ink)' }}>{p.name}</p>
                  <p className="font-mono-tb text-base font-bold mt-0.5" style={{ color: 'var(--tb-orange)' }}>{p.price}</p>
                </div>
              </SpecimenCard>
            ))}
          </div>
        </Section>

        {/* Mini checkout summary */}
        <Section label="06 / Checkout" title="Order summary block">
          <div className="tb-card tb-shadow max-w-sm p-5">
            <h3 className="font-black uppercase text-sm mb-4" style={{ color: 'var(--tb-ink)' }}>Order Summary</h3>
            {[['Subtotal', '₹1,648'], ['Shipping', 'Free'], ['Discount', '−₹165']].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 text-sm">
                <span style={{ color: 'var(--tb-ink-soft)' }}>{k}</span>
                <span className="font-mono-tb" style={{ color: 'var(--tb-ink)' }}>{v}</span>
              </div>
            ))}
            <div className="flex justify-between items-baseline mt-3 pt-3 border-t-2" style={{ borderColor: 'var(--tb-ink)' }}>
              <span className="font-black uppercase text-sm" style={{ color: 'var(--tb-ink)' }}>Total</span>
              <span className="font-mono-tb text-2xl font-bold" style={{ color: 'var(--tb-ink)' }}>₹1,483</span>
            </div>
            <TactileButton variant="primary" className="w-full mt-5">
              <Check size={16} /> Pay with UPI
            </TactileButton>
          </div>
        </Section>

      </div>
    </div>
  );
}
