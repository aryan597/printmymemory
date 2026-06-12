import { motion } from 'framer-motion';
import { XCircle, ShieldAlert, Video, RotateCcw } from 'lucide-react';

export default function ReturnRefund() {
  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            Return & <span className="text-accent">Refund</span>
          </h1>
          <p className="text-text-secondary">Our policy is strict because custom art is personal</p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-red-400/5 border border-red-400/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <XCircle size={20} className="text-red-400" />
              <h2 className="text-text-primary font-semibold text-lg">No Returns on Custom Products</h2>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Every item we make is uniquely personalized to your photo and specifications. 
              A returned lithophane lamp containing your family photo has zero resale value. 
              It is literally unusable for anyone else. This is why we do not offer returns on custom orders.
            </p>
          </motion.div>

          <Section icon={ShieldAlert} title="Damaged in Transit? We Got You" color="text-accent">
            <p className="text-text-secondary text-sm leading-relaxed mb-3">
              If your package arrives damaged, we will replace it free of charge, but we need proof.
            </p>
            <div className="bg-bg-primary border border-border-subtle rounded-xl p-4">
              <p className="text-text-primary font-medium text-sm mb-2">The Anti-Fraud Unboxing Mandate</p>
              <p className="text-text-secondary text-sm">
                To qualify for a free replacement, you must submit a <strong>continuous, unedited video clip</strong> of the 
                package being opened from its original sealed state. The video must clearly show:
              </p>
              <ul className="mt-2 space-y-1 text-text-secondary text-sm">
                <li>• The sealed package before opening</li>
                <li>• The unboxing process without cuts</li>
                <li>• The damaged product inside</li>
              </ul>
            </div>
          </Section>

          <Section icon={RotateCcw} title="When Refunds ARE Possible" color="text-emerald-400">
            <ul className="space-y-2 text-text-secondary text-sm">
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1">•</span><span>If we fail to deliver your order within 14 business days of confirmed payment (without communication)</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1">•</span><span>If the wrong product was shipped (proven with photos)</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-1">•</span><span>If we cancel the order due to technical inability to print your design</span></li>
            </ul>
            <p className="text-text-muted text-xs mt-3">
              Refunds are processed within 5-7 business days to the original payment method.
            </p>
          </Section>

          <Section icon={Video} title="How to Report an Issue" color="text-cyan-400">
            <ol className="space-y-3 text-text-secondary text-sm">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <span>WhatsApp us at <strong>+91-7463812249</strong> within 24 hours of delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <span>Share the unboxing video + photos of the damage</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <span>We will review and respond within 48 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-400/10 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">4</span>
                <span>Approved replacements are reprinted and shipped within 5-7 days</span>
              </li>
            </ol>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ icon: Icon, title, color, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-bg-card border border-border-subtle rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('400', '400/10').replace('accent', 'accent/10')}`}>
          <Icon size={18} className={color} />
        </div>
        <h2 className="text-text-primary font-semibold text-lg">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}
