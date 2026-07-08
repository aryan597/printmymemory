import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '919471725271';

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button no-print fixed bottom-6 right-6 z-50 w-14 h-14 text-white flex items-center justify-center border-2 border-border tb-press transition-transform duration-150"
      style={{ background: 'var(--tb-wa)' }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} className="fill-white" aria-hidden="true" />
    </a>
  );
}
