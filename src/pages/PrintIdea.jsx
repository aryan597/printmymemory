import { useLocation, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Package, Truck, ShieldCheck, Clock } from 'lucide-react';
import PageHead from '../components/PageHead';

const WHATSAPP_NUMBER = '919471725271';

const WaIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// The WhatsApp order carries the model's source URL so the team can identify,
// download, print, and check licensing.
function orderLink(model) {
  const lines = [
    `Hi PrintMyMemory! I'd like to get this design printed:`,
    ``,
    `Design: ${model.title}`,
    model.url ? `Model: ${model.url}` : null,
    ``,
    `Can you print this for me? What would it cost?`,
  ].filter((l) => l !== null);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export default function PrintIdea() {
  const { state } = useLocation();
  const { source } = useParams();
  const model = state?.model;

  if (!model) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <Package size={40} className="text-text-muted mb-4" />
        <h1 className="text-xl font-bold text-text-primary mb-2">Design not found</h1>
        <p className="text-text-secondary text-sm mb-6 max-w-sm">Open this design from the homepage to see the details.</p>
        <Link to="/" className="btn-primary">Back to home</Link>
      </main>
    );
  }

  const formats = Array.isArray(model.formats) ? model.formats.slice(0, 6) : [];

  return (
    <main className="min-h-screen bg-bg-primary">
      <PageHead title={model.title} description={`${model.title} — 3D printed to order in Bangalore by PrintMyMemory.`} image={model.imageLarge || model.image} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
          <ArrowLeft size={15} /> Back
        </Link>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
          {/* Image */}
          <div className="rounded-3xl overflow-hidden bg-bg-card border border-border">
            <img
              src={model.imageLarge || model.image || '/images/products/placeholder.jpg'}
              alt={model.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = model.image || '/images/products/placeholder.jpg'; }}
            />
          </div>

          {/* Info */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-5">
            {model.printReady && <span className="section-label">Print ready</span>}
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">{model.title}</h1>

            {model.description && (
              <p className="text-text-secondary text-sm leading-relaxed line-clamp-6">{model.description}</p>
            )}

            {formats.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formats.map((f) => <span key={f} className="tb-chip uppercase">{f}</span>)}
              </div>
            )}

            <div className="rounded-2xl bg-bg-card border border-border-subtle p-4">
              <p className="text-text-primary font-semibold text-[15px]">Made to order in Bangalore</p>
              <p className="text-text-muted text-xs mt-1">Send it over and we'll confirm the material, size, and price. Usually ships in 48 hours.</p>
            </div>

            <a href={orderLink(model)} target="_blank" rel="noopener noreferrer" className="btn-green w-full py-3.5 text-base">
              <WaIcon /> Order this print on WhatsApp
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Truck, title: 'Flat ₹50 shipping', sub: 'On every order' },
                { icon: ShieldCheck, title: 'Quality checked', sub: 'Hand-finished' },
                { icon: Clock, title: 'Ships in 48hrs', sub: 'Fast turnaround' },
                { icon: Check, title: 'Made to order', sub: 'Just for you' },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-2.5 p-3 rounded-xl bg-bg-card border border-border-subtle">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-text-primary text-[11px] font-semibold leading-tight">{title}</p>
                    <p className="text-text-muted text-[10px]">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
