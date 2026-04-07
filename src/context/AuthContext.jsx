import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
    };

    useEffect(() => {
        console.log('[Auth] AuthContext mounted. Initialization started.');
        let mounted = true;

        const fallbackTimer = setTimeout(() => {
            console.log(`[Auth] Triggering fallbackTimer. mounted=${mounted}, loading=${loading}`);
            if (mounted && loading) {
                console.warn('[Auth] Auth fallback timer triggered. Removing loading block and manually reading session.');

                try {
                    console.log('[Auth] Attempting to manually recover session from localStorage...');
                    // Attempt to manually recover session from localStorage to prevent logout
                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                    if (supabaseUrl) {
                        const projectId = new URL(supabaseUrl).hostname.split('.')[0];
                        const storageKey = `sb-${projectId}-auth-token`;
                        console.log(`[Auth] Looked up storage key: ${storageKey}`);

                        const sessionData = JSON.parse(localStorage.getItem(storageKey) || 'null');

                        if (sessionData && sessionData.user) {
                            console.log('[Auth] Manually recovered user from localStorage:', sessionData.user.email);
                            setUser(sessionData.user);
                            // Do not await fetchProfile here to avoid hanging; layout handles missing profile
                        } else {
                            console.log('[Auth] No valid user found in local storage.');
                        }
                    }
                } catch (e) {
                    console.error('[Auth] Manual session recovery failed:', e);
                }

                console.log('[Auth] Forcing loading to false via fallback timer.');
                setLoading(false);
            }
        }, 1500); // Reduced to 1.5 seconds so the user barely notices the hang

        console.log('[Auth] Registering onAuthStateChange listener...');
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log(`[Auth] onAuthStateChange event fired: ${event}`);
                console.log(`[Auth] Session details:`, session ? session.user.email : 'No session');

                if (!mounted) {
                    console.log('[Auth] Component unmounted, ignoring auth state change.');
                    return;
                }

                try {
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        try {
                            console.log(`[Auth] Fetching profile for user ${session.user.id}...`);
                            await fetchProfile(session.user.id);
                            console.log(`[Auth] Profile fetched successfully.`);
                        } catch (err) {
                            console.error('[Auth] fetchProfile error during auth init:', err);
                        }
                    } else {
                        console.log('[Auth] No user found, setting profile to null.');
                        setProfile(null);
                    }
                } finally {
                    if (mounted) {
                        console.log('[Auth] onAuthStateChange finally block: ending loading state.');
                        setLoading(false);
                        clearTimeout(fallbackTimer);
                    }
                }
            }
        );

        return () => {
            console.log('[Auth] AuthContext unmounting. Cleaning up...');
            mounted = false;
            clearTimeout(fallbackTimer);
            subscription?.unsubscribe();
        };
    }, []);

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        return { data, error };
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const isAdmin = profile?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}
