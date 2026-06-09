import { useState } from 'react';
import { supabase, TABLES } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export function useNewsletter() {
  const [subscribing, setSubscribing] = useState(false);

  const subscribe = async (email) => {
    setSubscribing(true);
    try {
      // Check if already subscribed
      const { data: existing } = await supabase
        .from(TABLES.NEWSLETTER_SUBS)
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        toast.info('You are already subscribed to our newsletter!');
        return { success: true, message: 'Already subscribed' };
      }

      const { error } = await supabase
        .from(TABLES.NEWSLETTER_SUBS)
        .insert({ email });

      if (error) {
        // If table doesn't exist yet, show friendly message
        if (error.message.includes('does not exist')) {
          toast.error('Newsletter system is being set up. Please try again later.');
          return { success: false, message: 'Table not ready' };
        }
        throw error;
      }

      toast.success('Thanks for subscribing! You will hear from us soon.');
      return { success: true, message: 'Subscribed' };
    } catch (err) {
      toast.error(err.message || 'Failed to subscribe. Please try again.');
      return { success: false, message: err.message };
    } finally {
      setSubscribing(false);
    }
  };

  return { subscribe, subscribing };
}
