import { motion } from 'framer-motion';
import { Upload, PenTool, Printer, Truck } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Upload Photo',
    description: 'Upload a clear photo of your loved one',
  },
  {
    number: 2,
    icon: PenTool,
    title: 'We Design',
    description: 'Our experts design the perfect 3D model',
  },
  {
    number: 3,
    icon: Printer,
    title: 'We Print',
    description: 'High quality 3D printing with premium materials',
  },
  {
    number: 4,
    icon: Truck,
    title: 'We Deliver',
    description: 'Carefully packed and delivered to your door',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-3">
            How It <span className="text-accent">Works</span>
          </h2>
          <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto">
            Simple steps to create your perfect 3D gift
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-[60px] left-[12.5%] right-[12.5%] h-0.5 border-t-2 border-dashed border-border-subtle" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="text-center"
            >
              <div className="relative inline-flex flex-col items-center">
                {/* Number badge */}
                <div className="w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center mb-4 relative z-10">
                  {step.number}
                </div>
                {/* Icon circle */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center mb-4">
                  <step.icon size={24} className="text-accent" />
                </div>
              </div>
              <h3 className="text-text-primary font-semibold text-base sm:text-lg mb-1.5">
                {step.title}
              </h3>
              <p className="text-text-secondary text-xs sm:text-sm max-w-[200px] mx-auto leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
