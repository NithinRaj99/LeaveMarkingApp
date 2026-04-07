import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// FIX FOR SUPABASE INTERNAL QUEUE HANG (POSTGREST + AUTH DEADLOCK):
// When reloading, orphaned GoTrue storage locks can cause the internal token-refresh 
// promise to hang infinitely, meaning ALL `supabase.from()` wait in queue forever!
try {
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.includes('-lock') || key.startsWith('supabase.auth.lock'))) {
            console.warn('[Supabase] Found orphaned lock, purging:', key);
            window.localStorage.removeItem(key);
        }
    }
} catch (e) {
    console.warn('Could not clear locks:', e);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: window.localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // disabled as a workaround for known hash deadlocks
    },
    global: {
        fetch: async (...args) => {
            console.log('[Supabase Fetch] initiating request to:', args[0]);
            try {
                const response = await fetch(...args);
                console.log('[Supabase Fetch] completed:', response.status, args[0]);
                return response;
            } catch (err) {
                console.error('[Supabase Fetch] failed:', err);
                throw err;
            }
        }
    }
});
