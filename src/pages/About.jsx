import { motion } from 'framer-motion';
import { Award, Users, Printer, Heart } from 'lucide-react';

const stats = [
  { icon: Heart, value: '5000+', label: 'Happy Customers' },
  { icon: Printer, value: '10000+', label: '3D Prints Made' },
  { icon: Users, value: '25+', label: 'Team Members' },
  { icon: Award, value: '4.9', label: 'Average Rating' },
];

const values = [
  {
    title: 'Quality First',
    description: 'We use only premium materials and state-of-the-art 3D printing technology to ensure every product meets our high standards.',
  },
  {
    title: 'Made with Love',
    description: 'Every gift we create carries the emotion and memories of our customers. We treat each order with personal care.',
  },
  {
    title: 'Customer Obsessed',
    description: 'Our customers are at the heart of everything we do. We go above and beyond to deliver happiness.',
  },
];

export default function About() {
  return (
    <main className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            About <span className="text-accent">PrintMyMemory</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto">
            We are passionate about turning your precious memories into tangible, beautiful 3D printed keepsakes that last forever.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-bg-card border border-border-subtle rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon size={20} className="text-accent" />
              </div>
              <p className="text-2xl font-bold text-text-primary mb-1">{stat.value}</p>
              <p className="text-text-muted text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid lg:grid-cols-2 gap-8 mb-16 items-center"
        >
          <div className="rounded-2xl overflow-hidden border border-border-subtle">
            <img
              src="/images/model1_raw_generated.jpeg"
              alt="Our Work"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Our Story</h2>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>
                PrintMyMemory was born from a simple idea: what if we could hold our memories in our hands? Founded in 2020, we started as a small 3D printing studio in Mumbai with a mission to create meaningful, personalized gifts.
              </p>
              <p>
                Today, we've served over 5,000 customers across India, transforming their photos into stunning 3D face miniatures, lithophane lamps, and custom keepsakes. Each piece we create is a labor of love, crafted with precision and care.
              </p>
              <p>
                Our team of designers and 3D printing experts work tirelessly to ensure every product exceeds expectations. We believe that the best gifts are personal, and nothing is more personal than a 3D printed memory.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {values.map((value) => (
              <div key={value.title} className="bg-bg-card border border-border-subtle rounded-xl p-6">
                <h3 className="text-text-primary font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
