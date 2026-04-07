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
                console.warn('Auth fallback timer triggered. Removing loading block.');
                setLoading(false);
            }
        }, 3000);

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
