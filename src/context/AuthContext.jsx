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

        // Fallback: If Supabase hangs for any reason (e.g., token refresh deadlock),
        // we forcefully drop the loading screen after 3 seconds.
        const fallbackTimer = setTimeout(() => {
            if (mounted) {
                console.warn('Auth fallback timer triggered! Supabase is hanging.');
                setLoading(false);
            }
        }, 3000);

        const initSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('getSession error:', error);
                }

                const session = data?.session;
                if (mounted) {
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        try {
                            await fetchProfile(session.user.id);
                        } catch (profileErr) {
                            console.error('fetchProfile error in initSession:', profileErr);
                        }
                    }
                }
            } catch (err) {
                console.error('Unhandled Session init error:', err);
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(fallbackTimer);
                }
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('onAuthStateChange event:', event);

                try {
                    if (mounted) setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    } else {
                        if (mounted) setProfile(null);
                    }
                } catch (err) {
                    console.error('onAuthStateChange exception:', err);
                } finally {
                    if (mounted) {
                        setLoading(false);
                        clearTimeout(fallbackTimer);
                    }
                }
            }
        );

        initSession();

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
