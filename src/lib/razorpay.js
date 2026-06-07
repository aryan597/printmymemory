// Razorpay payment integration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo';

export const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
};

export const createOrder = async (amount, items, user) => {
  // In production, this should call your backend/Supabase Edge Function
  // For demo, we'll create a mock order and open Razorpay
  return {
    id: `order_${Date.now()}`,
    amount: amount * 100, // paise
    currency: 'INR',
  };
};

export const openRazorpayCheckout = async (orderDetails, user, onSuccess, onError) => {
  try {
    await loadRazorpayScript();

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderDetails.amount,
      currency: orderDetails.currency,
      name: 'PrintMyMemory',
      description: 'Personalized 3D Printed Gifts',
      image: '/images/model1.jpeg',
      order_id: orderDetails.id,
      handler: function (response) {
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      prefill: {
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        contact: user?.user_metadata?.phone || '',
      },
      theme: {
        color: '#f97316',
      },
      modal: {
        ondismiss: function () {
          onError(new Error('Payment cancelled by user'));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    onError(error);
  }
};
