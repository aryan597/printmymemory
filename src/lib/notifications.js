import emailjs from '@emailjs/browser';

const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_ORDER_TEMPLATE = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID;
const EMAILJS_STATUS_TEMPLATE = import.meta.env.VITE_EMAILJS_STATUS_TEMPLATE_ID;

const isEmailConfigured = () =>
  EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_ORDER_TEMPLATE;

/**
 * Send order confirmation email to customer.
 * Template expects these variables:
 *   {{order_id}}, {{email}}
 *   {{#orders}} {{image_url}}, {{name}}, {{units}}, {{price}} {{/orders}}
 *   {{cost.shipping}}, {{cost.tax}}, {{cost.total}}
 */
export const sendOrderConfirmationEmail = async ({
  to_email,
  to_name,
  order_id,
  total_amount,
  payment_method,
  items,
  order_date,
  delivery,
}) => {
  if (!isEmailConfigured()) {
    console.warn('[Email] EmailJS not configured. Skipping email.');
    return { skipped: true };
  }

  const orders = (items || []).map(item => ({
    image_url: item.product?.image || item.image || `${window.location.origin}/images/products/model1.jpeg`,
    name: item.product?.name || item.name || 'Product',
    units: item.quantity || 1,
    price: item.product?.price || item.price || 0,
  }));

  const shipping = 0;
  const tax = 0;

  try {
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_ORDER_TEMPLATE,
      {
        to_email,
        to_name: to_name || 'Valued Customer',
        email: to_email,
        order_id: order_id?.slice(0, 8).toUpperCase() || '',
        orders,
        cost: {
          shipping,
          tax,
          total: total_amount,
        },
        payment_method: payment_method === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)',
        order_date: order_date || new Date().toLocaleDateString('en-IN'),
        brand_name: 'PrintMyMemory',
        website_link: window.location.origin,
        delivery: delivery || {},
      },
      EMAILJS_PUBLIC_KEY
    );
    return { success: true, result };
  } catch (err) {
    console.error('[Email] Failed to send confirmation:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Send status update email to customer.
 */
export const sendStatusUpdateEmail = async ({
  to_email,
  to_name,
  order_id,
  status,
  status_label,
  note,
  delivery,
}) => {
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_STATUS_TEMPLATE) {
    console.warn('[Email] Status template not configured. Skipping email.');
    return { skipped: true };
  }

  try {
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_STATUS_TEMPLATE,
      {
        to_email,
        to_name: to_name || 'Valued Customer',
        order_id: order_id?.slice(0, 8).toUpperCase() || '',
        status,
        status_label: status_label || status,
        note: note || 'No additional notes.',
        brand_name: 'PrintMyMemory',
        website_link: window.location.origin,
        delivery: delivery || {},
      },
      EMAILJS_PUBLIC_KEY
    );
    return { success: true, result };
  } catch (err) {
    console.error('[Email] Failed to send status update:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Generate WhatsApp click-to-chat link for customised orders
 */
export const getWhatsAppOrderLink = ({
  phone = import.meta.env.VITE_WHATSAPP_NUMBER || '917463812249',
  order_id,
  customer_name,
  product_name,
}) => {
  const text = encodeURIComponent(
    `Hi PrintMyMemory!\n\n` +
    `I just placed a customised order #${order_id?.slice(0, 8).toUpperCase() || ''}.\n` +
    `Product: ${product_name || 'Custom 3D Print'}\n` +
    `Name: ${customer_name || ''}\n\n` +
    `Please guide me on how to share the photo/design details.`
  );
  return `https://wa.me/${phone}?text=${text}`;
};

/**
 * Generate WhatsApp admin follow-up link for a specific order
 */
export const getAdminWhatsAppLink = ({
  customerPhone,
  order_id,
  message,
}) => {
  const cleanPhone = customerPhone?.replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 10) return null;
  const text = encodeURIComponent(message || '');
  return `https://wa.me/${cleanPhone}?text=${text}`;
};

/**
 * Check if an order is ready for printing
 */
export const isReadyForPrint = (order) => {
  const type = order.items?.[0]?.product?.product_type || 'uncustomised';
  if (type === 'customised') {
    return order.status === 'approved';
  }
  return order.status === 'order_placed' || order.status === 'packed';
};
