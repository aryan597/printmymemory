/**
 * Utility functions for PrintMyMemory
 */

/**
 * Format price with consistent ₹ symbol and Indian locale
 * @param {number} price - Price amount
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) return '₹0';
  return '₹' + Number(price).toLocaleString('en-IN');
}

/**
 * Merge Tailwind CSS classes, handling conflicts
 * @param  {...string} classes - Class names to merge
 * @returns {string} Merged class string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID string
 */
export function generateId() {
  return 'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Format date to Indian locale
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(isoDate) {
  if (!isoDate) return '-';
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate Indian phone number (10 digits)
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid phone
 */
export function isValidPhone(phone) {
  const clean = phone?.replace(/\D/g, '');
  return clean?.length === 10;
}

/**
 * Validate Indian PIN code (6 digits)
 * @param {string} pin - PIN code
 * @returns {boolean} Is valid PIN
 */
export function isValidPin(pin) {
  return /^[0-9]{6}$/.test(pin);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get image loading strategy based on position
 * @param {number} index - Image index in list
 * @returns {Object} Loading attributes
 */
export function getImageLoadingProps(index = 0) {
  if (index === 0) {
    return { loading: 'eager', fetchPriority: 'high', decoding: 'async' };
  }
  return { loading: 'lazy', decoding: 'async' };
}
