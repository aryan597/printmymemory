import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '917463812249';

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-whatsapp text-white rounded-full flex items-center justify-center shadow-soft-lg hover:scale-105 transition-transform duration-300"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={24} className="fill-white" />
    </a>
  );
}
