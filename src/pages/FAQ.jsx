import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Printer, CreditCard, Truck, ImageIcon, Clock } from 'lucide-react';

const faqs = [
  {
    icon: Printer,
    question: 'What printer do you use?',
    answer: 'We use a Bambu Lab FDM 3D printer with standard PLA filament. FDM (Fused Deposition Modeling) builds objects layer by layer, which gives our products a distinctive, textured finish. For lithophane lamps, the light passing through the thin walls creates the photo effect.',
  },
  {
    icon: ImageIcon,
    question: 'What kind of photo should I upload?',
    answer: 'High-resolution photos work best — ideally 1MB+ with clear facial features. For lithophane lamps, well-lit portraits with good contrast produce the best results. Avoid blurry, dark, or heavily filtered images. We will review your photo before printing and let you know if it needs replacement.',
  },
  {
    icon: Clock,
    question: 'How long does it take?',
    answer: 'From order to dispatch: 5-7 business days. This includes design preview (24h), your approval (up to 48h), and actual printing time (1.5h for bookmarks, up to 11h for moon lamps). Shipping adds another 3-7 days depending on your location.',
  },
  {
    icon: CreditCard,
    question: 'Why no Cash on Delivery (COD)?',
    answer: 'Every product is made specifically for you with your photo. If you refuse delivery, we are left with a 100% un-resellable item and double courier costs. This is standard practice for personalized commodities. We accept UPI, Cards, and all major wallets via Razorpay.',
  },
  {
    icon: Truck,
    question: 'Do you ship outside India?',
    answer: 'Currently, we only ship within India. Pan-India delivery is available from Day 1 via Shiprocket. International shipping may be added in the future.',
  },
  {
    icon: Printer,
    question: 'What is a lithophane?',
    answer: 'A lithophane is a 3D printed object where the image is embedded into the thickness of the material. When backlit, the varying thickness creates a stunning grayscale image. It is not painted or printed on the surface — the image IS the object.',
  },
  {
    icon: CreditCard,
    question: 'Can I cancel my order?',
    answer: 'You can cancel before the design is approved (status: pending_photo or order_placed). Once printing begins, cancellation is not possible since the product is already being made for you.',
  },
  {
    icon: ImageIcon,
    question: 'What if I do not like the design preview?',
    answer: 'You can request changes within 48 hours of receiving the preview. Just reply to the WhatsApp/DM with your feedback. We will revise and resend. If you are still not satisfied after 2 revisions, we offer a full refund before printing begins.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

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
            Frequently Asked <span className="text-accent">Questions</span>
          </h1>
          <p className="text-text-secondary">Everything you need to know before ordering</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <faq.icon size={15} className="text-accent" />
                </div>
                <span className="flex-1 text-text-primary font-medium text-sm sm:text-base">{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={`text-text-muted shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 pl-16">
                      <p className="text-text-secondary text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 bg-accent/5 border border-accent/20 rounded-2xl p-6 text-center"
        >
          <p className="text-text-primary font-medium mb-1">Still have questions?</p>
          <p className="text-text-secondary text-sm mb-4">DM us on Instagram or WhatsApp. We reply fast.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://wa.me/917463812249"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-whatsapp text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              WhatsApp Us
            </a>
            <a
              href="https://instagram.com/giftedwithlove.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-bg-card border border-border-subtle text-text-primary px-4 py-2 rounded-lg text-sm font-medium hover:border-accent/40 transition-colors"
            >
              Instagram DM
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
