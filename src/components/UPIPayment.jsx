import { useState, useRef } from 'react';
import { Copy, CheckCircle, QrCode, ArrowRight, MessageCircle, Upload, ImageIcon, Loader2, X, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

const UPI_ID = '7463812259@ybl';

export default function UPIPayment({ amount, orderId, onPaymentComplete, customerName }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [step, setStep] = useState('pay'); // 'pay' | 'screenshot' | 'done'
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const upiLink = `upi://pay?pa=${UPI_ID}&pn=PrintMyMemory&am=${amount}&cu=INR&tn=Order_${orderId?.slice(0, 8)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiLink)}`;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success('UPI ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10 MB');
      return;
    }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect({ target: { files: [file] } });
  };

  const submitScreenshot = async () => {
    if (!screenshot) {
      toast.error('Please upload your payment screenshot first');
      return;
    }
    setUploading(true);
    try {
      const ext = screenshot.name.split('.').pop() || 'jpg';
      const path = `payment-screenshots/${orderId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('order-assets')
        .upload(path, screenshot, { contentType: screenshot.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('order-assets')
        .getPublicUrl(path);

      // Save screenshot URL to order
      await supabase
        .from('orders')
        .update({ payment_screenshot_url: publicUrl })
        .eq('id', orderId);

      setStep('done');
      // Trigger parent callback — order stays pending_payment until admin verifies
      onPaymentComplete({ screenshotUrl: publicUrl, verified: false });
    } catch (err) {
      console.error('Screenshot upload error:', err);
      toast.error('Upload failed. Please share the screenshot on WhatsApp instead.');
    } finally {
      setUploading(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
          <ShieldCheck size={28} className="text-green-400" />
        </div>
        <h3 className="text-white font-bold text-lg">Screenshot received!</h3>
        <p className="text-text-secondary text-sm max-w-xs mx-auto leading-relaxed">
          We'll verify your payment and confirm your order within a few minutes. You'll get a WhatsApp message from us.
        </p>
        <a
          href={`https://wa.me/919471725271?text=Hi! I placed order ${orderId?.slice(0, 8)} and uploaded my payment screenshot. Please confirm.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-400 hover:text-green-300 transition-colors mt-2"
        >
          <MessageCircle size={15} />
          Also notify us on WhatsApp
        </a>
      </div>
    );
  }

  if (step === 'screenshot') {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('pay')}
            className="text-text-muted hover:text-white transition-colors"
            aria-label="Back to payment"
          >
            <ArrowRight size={16} className="rotate-180" />
          </button>
          <div>
            <h3 className="text-white font-bold text-sm">Upload Payment Screenshot</h3>
            <p className="text-text-muted text-xs">Required to confirm your order</p>
          </div>
        </div>

        {/* Amount reminder */}
        <div className="px-4 py-3 rounded-xl bg-accent/8 border border-accent/20 flex items-center justify-between">
          <span className="text-text-secondary text-xs">You paid</span>
          <span className="text-accent font-black text-lg">Rs. {amount.toLocaleString('en-IN')}</span>
        </div>

        {/* Drop zone */}
        {screenshotPreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-border">
            <img src={screenshotPreview} alt="Payment screenshot" className="w-full max-h-48 object-contain bg-bg-elevated" />
            <button
              onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              aria-label="Remove screenshot"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/3 transition-all duration-200"
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            role="button"
            aria-label="Upload payment screenshot"
          >
            <div className="w-12 h-12 rounded-2xl bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-3">
              <ImageIcon size={22} className="text-text-muted" />
            </div>
            <p className="text-white font-semibold text-sm mb-1">Drop screenshot here</p>
            <p className="text-text-muted text-xs">or click to browse · PNG, JPG up to 10 MB</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          aria-label="Upload payment screenshot"
        />

        <button
          onClick={submitScreenshot}
          disabled={!screenshot || uploading}
          className="w-full btn-primary py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <><Loader2 size={16} className="animate-spin" /> Uploading...</>
          ) : (
            <><Upload size={16} /> Submit & Confirm Order</>
          )}
        </button>

        <p className="text-center text-text-muted text-xs">
          Your order will be confirmed once we verify the payment (usually within 5-10 minutes).
        </p>
      </div>
    );
  }

  // Default: 'pay' step
  return (
    <div className="space-y-4">
      {/* Amount */}
      <div className="text-center p-4 rounded-2xl bg-accent/8 border border-accent/20">
        <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest mb-1">Amount to Pay</p>
        <p className="text-3xl font-black text-white">Rs. {amount.toLocaleString('en-IN')}</p>
      </div>

      {/* UPI ID */}
      <div className="p-4 rounded-2xl bg-bg-elevated border border-border-subtle">
        <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest mb-3">Pay via UPI ID</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2.5 rounded-xl bg-bg-card border border-border-subtle flex items-center gap-2">
            <QrCode size={15} className="text-accent shrink-0" />
            <span className="text-white font-mono text-sm">{UPI_ID}</span>
          </div>
          <button
            onClick={copyUPI}
            className="p-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors"
            aria-label="Copy UPI ID"
          >
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* QR */}
      <div className="p-4 rounded-2xl bg-bg-elevated border border-border-subtle">
        <div className="flex items-center justify-between mb-3">
          <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest">Scan QR Code</p>
          <button
            onClick={() => setShowQR(!showQR)}
            className="text-xs text-accent hover:underline"
          >
            {showQR ? 'Hide' : 'Show'}
          </button>
        </div>
        {showQR && (
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-2xl bg-white">
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-44 h-44" />
            </div>
            <p className="text-text-muted text-xs text-center">GPay, PhonePe, Paytm, or your bank app</p>
          </div>
        )}
      </div>

      {/* Quick open */}
      <a
        href={upiLink}
        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl bg-bg-elevated border border-border-subtle text-white hover:border-border text-sm font-medium transition-colors"
      >
        Open UPI App directly
      </a>

      {/* CTA */}
      <button
        onClick={() => setStep('screenshot')}
        className="w-full btn-primary py-3.5"
      >
        I've Paid - Upload Screenshot
        <ArrowRight size={15} />
      </button>

      <p className="text-center text-text-muted text-xs">
        After paying, you'll upload your payment screenshot so we can verify and process your order.
      </p>
    </div>
  );
}
