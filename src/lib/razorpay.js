const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.includes('demo')) {
  console.warn('[Razorpay] VITE_RAZORPAY_KEY_ID is not set. Payments will not work.');
}

export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay checkout in standard payment mode.
 * Does NOT require a pre-created order (no server-side order creation needed).
 * 
 * @param {Object} options
 * @param {number} options.amount - Amount in INR (rupees, not paise; converted inside)
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.name - Customer name
 * @param {string} options.email - Customer email
 * @param {string} options.phone - Customer phone
 * @param {string} options.orderName - Order description (default: 'Personalized 3D Printed Gifts')
 * @param {Function} onSuccess - Called with Razorpay response { razorpay_payment_id, razorpay_order_id?, razorpay_signature }
 * @param {Function} onError - Called on dismiss or failure
 */
export const openRazorpayCheckout = async (
  { amount, currency = 'INR', name = '', email = '', phone = '', orderName = 'Personalized 3D Printed Gifts' },
  onSuccess,
  onError
) => {
  if (!RAZORPAY_KEY_ID || RAZORPAY_KEY_ID.includes('demo')) {
    onError(new Error('Razorpay key is not configured. Check .env file.'));
    return;
  }

  await loadRazorpayScript();

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // Convert to paise
    currency,
    name: 'PrintMyMemory',
    description: orderName,
    image: '/favicon.svg',
    prefill: {
      name: name || '',
      email: email || '',
      contact: phone || '',
    },
    notes: {
      source: 'storefront',
      brand: 'PrintMyMemory',
    },
    theme: {
      color: '#f97316',
    },
    modal: {
      ondismiss: () => {
        onError(new Error('Payment cancelled'));
      },
      escape: false,
    },
    handler: (response) => {
      onSuccess(response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
