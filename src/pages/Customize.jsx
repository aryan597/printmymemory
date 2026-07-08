/**
 * /customize — full-page AI design concierge (same engine as the hero panel).
 * People land here from nav / "Chat with us" links; the hero opens the same
 * chat as an overlay.
 */
import { Sparkles } from 'lucide-react';
import PageHead from '../components/PageHead';
import AssistantChat from '../components/assistant/AssistantChat';

export default function Customize() {
  return (
    <main className="bg-bg-primary">
      <PageHead
        title="Design Concierge"
        description="Tell our AI design concierge what you want to 3D print. Describe your idea or attach a photo and we'll help you make it real."
        path="/customize"
      />
      <div className="max-w-2xl mx-auto px-4 flex flex-col" style={{ height: '100dvh' }}>
        <div className="pt-24 pb-3 shrink-0">
          <div className="section-label mb-3"><Sparkles size={11} /> Design concierge</div>
          <h1 className="font-bold text-text-primary text-2xl sm:text-3xl tracking-tight">What would you like to create?</h1>
          <p className="text-text-secondary text-sm mt-1.5">Describe your idea or attach a photo. We'll find or custom-make it.</p>
        </div>
        <div className="flex-1 min-h-0 pb-4">
          <AssistantChat autoFocus />
        </div>
      </div>
    </main>
  );
}
