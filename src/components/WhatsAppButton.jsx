import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919471725271';

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button no-print fixed bottom-6 right-6 z-50 w-13 h-13 sm:w-14 sm:h-14 bg-green-500 hover:bg-green-400 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-900/30 hover:scale-110 active:scale-95 transition-all duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} className="fill-white" aria-hidden="true" />
    </a>
  );
}
