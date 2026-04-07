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
        let mounted = true;

        const fallbackTimer = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth fallback timer triggered. Removing loading block and manually reading session.');

                try {
                    // Attempt to manually recover session from localStorage to prevent logout
                    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                    if (supabaseUrl) {
                        const projectId = new URL(supabaseUrl).hostname.split('.')[0];
                        const storageKey = `sb-${projectId}-auth-token`;
                        const sessionData = JSON.parse(localStorage.getItem(storageKey) || 'null');

                        if (sessionData && sessionData.user) {
                            setUser(sessionData.user);
                            // Do not await fetchProfile here to avoid hanging; layout handles missing profile
                        }
                    }
                } catch (e) {
                    console.error('Manual session recovery failed:', e);
                }

                setLoading(false);
            }
        }, 1500); // Reduced to 1.5 seconds so the user barely notices the hang

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                try {
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        try {
                            await fetchProfile(session.user.id);
                        } catch (err) {
                            console.error('fetchProfile error during auth init:', err);
                        }
                    } else {
                        setProfile(null);
                    }
                } finally {
                    if (mounted) {
                        setLoading(false);
                        clearTimeout(fallbackTimer);
                    }
                }
            }
        );

        return () => {
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
