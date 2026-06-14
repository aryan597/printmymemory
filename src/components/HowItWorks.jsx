import { ImageIcon, MessageCircle, PenTool, Printer, Truck } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: ImageIcon,
    title: 'Upload Photo',
    description: 'Upload a clear photo of your loved one',
  },
  {
    number: '2',
    icon: MessageCircle,
    title: 'Chat on WhatsApp',
    description: 'Share your photo and discuss your design with us',
  },
  {
    number: '3',
    icon: PenTool,
    title: 'Get Design Done',
    description: 'Our experts create the perfect 3D model for you',
  },
  {
    number: '4',
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
    title: 'We Print, Ship & Deliver',
    description: 'High quality 3D printing with premium materials, carefully packed and delivered',
  },
];

export default function HowItWorks() {
  return (
    <section className="section-padding bg-bg-secondary" aria-label="How it works">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-headline font-bold text-white">
            How It <span className="text-brand-orange">Works</span>
          </h2>
          <p className="text-text-muted text-sm mt-2">Simple steps to create your perfect 3D gift</p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative text-center"
              aria-label={`Step ${step.number}: ${step.title}`}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] right-0 w-full">
                  <div className="flex items-center gap-1">
                    {[...Array(8)].map((_, i) => (
                      <div key={`dot-${index}-${i}`} className="w-1 h-1 rounded-full bg-white/20" />
                    ))}
                  </div>
                </div>
              )}

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-card border border-border-subtle mb-4 relative">
                <step.icon size={22} className="text-brand-orange" />
                {/* Number badge */}
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center">
                  {step.number}
                </div>
              </div>

              <h3 className="text-white font-semibold text-sm mb-1">{step.title}</h3>
              <p className="text-text-muted text-xs leading-relaxed max-w-[200px] mx-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
