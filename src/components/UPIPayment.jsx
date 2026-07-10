import { useState } from 'react';
import { Copy, CheckCircle, QrCode, ArrowRight, MessageCircle, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const UPI_ID = '7463812249@ybl';

export default function UPIPayment({ amount, orderId, onPaymentComplete }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [step, setStep] = useState('pay'); // 'pay' | 'utr' | 'done'
  const [utr, setUtr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formattedAmount = Number(amount).toFixed(2);
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=PrintMyMemory&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(`Order_${orderId?.slice(0, 8)}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiLink)}`;

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    toast.success('UPI ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const submitUtr = async () => {
    if (!utr || utr.trim().length < 12) {
      toast.error('Please enter a valid 12-digit UTR / Transaction ID');
      return;
    }
    setSubmitting(true);
    try {
      // The parent creates the order (order-after-payment) and navigates away
      // on success. If it fails, the customer has already paid, so we show the
      // "done" screen with a WhatsApp fallback rather than losing their order.
      await onPaymentComplete({ utr: utr.trim(), verified: false });
    } catch (err) {
      console.error('Order confirmation error:', err?.message || err);
      toast.error('We could not confirm your order automatically. Please share your UTR with us on WhatsApp.');
      setStep('done');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'done') {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
          <ShieldCheck size={28} className="text-green-400" />
        </div>
        <h3 className="text-white font-bold text-lg">Payment Info Received!</h3>
        <p className="text-text-secondary text-sm max-w-xs mx-auto leading-relaxed">
          We will verify your UTR and confirm your order automatically within a few minutes. You'll receive a confirmation email.
        </p>
        <a
          href={`https://wa.me/919471725271?text=Hi! I placed order ${orderId?.slice(0, 8)} and submitted my UTR (${utr}). Please confirm.`}
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

  if (step === 'utr') {
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
            <h3 className="text-white font-bold text-sm">Enter UTR Number</h3>
            <p className="text-text-muted text-xs">Required to confirm your order</p>
          </div>
        </div>

        {/* Amount reminder */}
        <div className="px-4 py-3 rounded-xl bg-accent/8 border border-accent/20 flex items-center justify-between">
          <span className="text-text-secondary text-xs">You paid</span>
          <span className="text-accent font-black text-lg">Rs. {amount.toLocaleString('en-IN')}</span>
        </div>

        {/* UTR Input */}
        <div className="space-y-2">
          <label className="text-text-muted text-xs font-medium uppercase tracking-wider block">12-Digit UTR / Transaction ID</label>
          <input
            type="text"
            placeholder="e.g. 123456789012"
            value={utr}
            onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
            maxLength={12}
            className="w-full bg-bg-elevated border border-border-subtle rounded-xl px-4 py-3 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/50"
          />
          <p className="text-text-muted text-[10px]">
            You can find this in your PhonePe / GPay app under "Transaction Details".
          </p>
        </div>

        <button
          onClick={submitUtr}
          disabled={utr.length < 12 || submitting}
          className="w-full btn-primary py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Verifying...</>
          ) : (
            <><CheckCircle size={16} /> Submit & Confirm Order</>
          )}
        </button>

        <p className="text-center text-text-muted text-xs">
          Your order will be confirmed automatically once we verify the UTR (usually within minutes).
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
          <div className="flex-1 min-w-0 px-3 py-2.5 rounded-xl bg-bg-card border border-border-subtle flex items-center gap-2">
            <QrCode size={15} className="text-accent shrink-0" />
            <span className="text-white font-mono text-sm break-all">{UPI_ID}</span>
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
              <img src={qrCodeUrl} alt="UPI QR Code" className="w-40 h-40 sm:w-44 sm:h-44 max-w-full" />
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
        onClick={() => setStep('utr')}
        className="w-full btn-primary py-3.5"
      >
        I've Paid - Enter UTR
        <ArrowRight size={15} />
      </button>

      <p className="text-center text-text-muted text-xs">
        After paying, you'll enter your 12-digit UTR so we can verify and process your order automatically.
      </p>
    </div>
  );
}
