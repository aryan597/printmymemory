import { supabase } from './supabaseClient';

/**
 * Auth Diagnostics Utility
 * Helps identify why Supabase auth is not working.
 */

export async function runAuthDiagnostics() {
  const results = {
    urlConfigured: false,
    keyConfigured: false,
    keyLooksValid: false,
    canReachSupabase: false,
    authSettings: null,
    session: null,
    errors: [],
  };

  // 1. Check URL
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url || url === 'https://svaceoqmieqnvfxnjjdn.supabase.co') {
    results.errors.push('VITE_SUPABASE_URL is not set or is using the fallback URL.');
  } else {
    results.urlConfigured = true;
  }

  // 2. Check Anon Key
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key || key.length < 50) {
    results.errors.push(`VITE_SUPABASE_ANON_KEY is missing or too short (${key?.length || 0} chars). A valid key is 150+ chars.`);
  } else {
    results.keyConfigured = true;
    results.keyLooksValid = key.startsWith('eyJ');
    if (!results.keyLooksValid) {
      results.errors.push('VITE_SUPABASE_ANON_KEY does not look like a valid JWT token (should start with "eyJ").');
    }
  }

  // 3. Try to reach Supabase
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      results.errors.push(`Supabase connection error: ${error.message}`);
    } else {
      results.canReachSupabase = true;
      results.session = data.session;
    }
  } catch (err) {
    results.errors.push(`Network error: ${err.message}`);
  }

  // 4. Check auth settings
  try {
    const { data, error } = await supabase.auth.getSettings();
    if (!error) {
      results.authSettings = data;
    }
  } catch {
    // ignore
  }

  return results;
}

export function getAuthSetupGuide() {
  return `
🔧 Supabase Auth Setup Guide

1. Go to https://supabase.com and sign in to your project.
2. In the left sidebar, click "Project Settings" (gear icon at bottom).
3. Go to "API" section.
4. Copy:
   - URL → paste into VITE_SUPABASE_URL
   - anon public → paste into VITE_SUPABASE_ANON_KEY
5. In the left sidebar, click "Authentication" → "URL Configuration".
6. Add these Redirect URLs:
   - http://localhost:5173
   - https://your-domain.vercel.app (production)
7. Go to "Authentication" → "Providers" → "Email".
   - For development: turn OFF "Confirm email" to skip verification.
   - For production: keep it ON and set up SMTP.
8. Restart your dev server after updating .env.

If signup works but login fails:
→ You likely have "Confirm email" enabled but no SMTP configured.
→ Either disable it (dev) or set up SMTP (production).

If Google OAuth fails:
→ Go to "Authentication" → "Providers" → "Google".
→ Enable it and add your Google Client ID/Secret from Google Cloud Console.
→ Ensure the redirect URL in Google Console matches your Supabase redirect URL.
`;
}
